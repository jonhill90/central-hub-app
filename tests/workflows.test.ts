import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

// Spec 0004 requirements 5 and 6: workflow files grant no package writes and
// read no secret; every action is pinned by full sha; every base image by digest.

export function workflowProblems(text: string): string[] {
  const out: string[] = []
  if (/packages:\s*write/.test(text)) out.push('grants packages: write')
  if (/secrets\./.test(text)) out.push('reads a secret')
  for (const m of text.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)) {
    if (!/@[0-9a-f]{40}(\s|$)/.test(m[1] + ' ')) out.push(`action not pinned by sha: ${m[1]}`)
  }
  return out
}

export function dockerfileProblems(text: string): string[] {
  const out: string[] = []
  const stages = new Set<string>()
  for (const m of text.matchAll(/^FROM\s+(\S+)(?:\s+AS\s+(\S+))?/gim)) {
    if (m[2]) stages.add(m[2].toLowerCase())
    if (stages.has(m[1].toLowerCase())) continue
    if (!/@sha256:[0-9a-f]{64}$/.test(m[1])) out.push(`base image not pinned by digest: ${m[1]}`)
  }
  return out
}

const dir = path.join(process.cwd(), '.github', 'workflows')

describe('workflow files', () => {
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.yml'))) {
    it(`${f} has no package write, no secret, pinned actions`, () => {
      expect(workflowProblems(fs.readFileSync(path.join(dir, f), 'utf8'))).toEqual([])
    })
  }
  it('the Dockerfile pins every base image by digest', () => {
    expect(dockerfileProblems(fs.readFileSync('Dockerfile', 'utf8'))).toEqual([])
  })
  it('the checks reject bad input', () => {
    expect(workflowProblems('permissions:\n  packages: write\n')).toContain('grants packages: write')
    expect(workflowProblems('x: ${{ secrets.T }}')).toContain('reads a secret')
    expect(workflowProblems('      - uses: actions/checkout@v4\n')).toHaveLength(1)
    expect(dockerfileProblems('FROM node:22\n')).toHaveLength(1)
  })
})
