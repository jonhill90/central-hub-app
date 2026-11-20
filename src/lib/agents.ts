// The ONE module that reads agent sheet files. Pages call getAgents().
// To move the source (an API, another repository), replace this file only;
// tests/seam.test.ts enforces that.
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { toView, validateSheet, type AgentView } from './sheet'

const DIR = process.env.AGENTS_DIR ?? path.join(process.cwd(), 'catalog', 'agents')

export function parseSheet(text: string): Record<string, unknown> {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text)
  if (!m) throw new Error('sheet has no YAML front matter')
  const data = parse(m[1]) as Record<string, unknown>
  return { ...data, notes: m[2].trim() }
}

export function loadAgents(dir: string = DIR): AgentView[] {
  const files = readdirSync(/* turbopackIgnore: true */ dir).filter((f) => f.endsWith('.md')).sort()
  const sheets = files.map((f) => ({ file: f, sheet: parseSheet(readFileSync(path.join(/* turbopackIgnore: true */ dir, f), 'utf8')) }))
  const problems = validateSheet(sheets)
  if (problems.length) throw new Error('Agent sheets are not valid:\n' + problems.join('\n'))
  return sheets.map((s) => toView(s.sheet))
}

export function getAgents(): AgentView[] {
  return loadAgents()
}
