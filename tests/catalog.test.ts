import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@/lib/catalog'
import { validateCatalog } from '@/lib/validate'

describe('catalog', () => {
  const c = loadCatalog('catalog')
  it('every record has owner, docs link and exit path', () => {
    expect(validateCatalog(c)).toEqual([])
    for (const r of [...c.areas, ...c.rooms]) {
      expect(r.owner).toBeTruthy(); expect(r.docs).toMatch(/^https:\/\//); expect(r.exit_path).toBeTruthy()
    }
  })
  it('no room points at an area or room that does not exist', () => {
    const bad = { areas: c.areas, rooms: [{ ...c.rooms[0], area: 'nope', links: ['ghost'] }] }
    const p = validateCatalog(bad)
    expect(p.join('\n')).toContain('unknown area nope')
    expect(p.join('\n')).toContain('unknown room ghost')
  })
  it('flags a record missing its exit path', () => {
    const bad = { areas: [{ ...c.areas[0], exit_path: '' }], rooms: [] }
    expect(validateCatalog(bad).join()).toContain('missing exit_path')
  })
})
