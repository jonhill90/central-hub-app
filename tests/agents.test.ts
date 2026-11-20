import { describe, expect, it } from 'vitest'
import { loadAgents, parseSheet } from '@/lib/agents'
import { REQUIRED, show, toView, validateSheet } from '@/lib/sheet'
import { readFileSync } from 'node:fs'

const good = () => parseSheet(readFileSync('catalog/agents/builder.md', 'utf8'))
const check = (sheet: Record<string, unknown>, file = 'builder.md') => validateSheet([{ file, sheet }])

describe('agent sheets', () => {
  it('loads the sample sheets', () => {
    const a = loadAgents('catalog/agents')
    expect(a.map((x) => x.id).sort()).toEqual(['builder', 'reviewer'])
  })
  it('rejects a sheet missing a required key and names the key', () => {
    for (const k of REQUIRED) {
      const s = good(); delete s[k]
      expect(check(s).join()).toContain(`missing ${k}`)
    }
  })
  it('rejects an id that differs from the file name and a duplicate id', () => {
    expect(check(good(), 'other.md').join()).toContain('does not match the file name')
    const p = validateSheet([{ file: 'builder.md', sheet: good() }, { file: 'builder.md', sheet: good() }])
    expect(p.join()).toContain('duplicate id builder')
  })
  it('rejects secret-looking keys and values', () => {
    const k = good(); (k.runtime as Record<string, unknown>).api_key = 'x'
    expect(check(k).join()).toContain('secret-looking key')
    const v = good(); (v.runtime as Record<string, unknown>).auth_mode = 'sk-abc123'
    expect(check(v).join()).toContain('looks like a credential')
    const g = good(); (g.runtime as Record<string, unknown>).host = 'ghp_abc'
    expect(check(g).join()).toContain('looks like a credential')
  })
  it('keeps unknown as unknown and shows absent values as unknown, never zero or empty', () => {
    expect(show('unknown')).toBe('unknown')
    expect(show(undefined)).toBe('unknown')
    expect(show('')).toBe('unknown')
    const s = good(); delete (s.runtime as Record<string, unknown>).model
    const v = toView(s)
    const model = v.sections[1].fields.find((f) => f.label === 'model')!
    expect(model.value).toBe('unknown')
    const budgets = v.sections[5].fields.find((f) => f.label === 'tokens')!
    expect(budgets.value).toBe('unknown')
  })
  it('has ten sections in a fixed order and no level, rating or score', () => {
    const v = toView(good())
    expect(v.sections.map((x) => x.title)).toEqual([
      'Identity', 'Runtime', 'Capabilities', 'Equipment', 'Authority (ceiling)', 'Budgets',
      'Memory and knowledge', 'Interface and handoff', 'Coordination and lifecycle', 'Evaluations',
    ])
    const labels = v.sections.flatMap((x) => x.fields.map((f) => f.label.toLowerCase()))
    expect(labels.filter((l) => /\b(level|rating|score|xp)\b/.test(l))).toEqual([])
  })
})
