import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@/lib/catalog'
import { buildNav } from '@/lib/nav'

describe('nav builder', () => {
  const c = loadCatalog('catalog')
  it('gives the same menu for the same catalog', () => {
    expect(buildNav(c)).toEqual(buildNav(structuredClone(c)))
  })
  it('has one group per area and one link per room', () => {
    const n = buildNav(c)
    expect(n.areas.map((a) => a.id)).toEqual(c.areas.map((a) => a.id))
    expect(n.areas.flatMap((a) => a.children).length).toBe(c.rooms.length)
  })
  it('a room missing from the catalog is not in the menu', () => {
    const fewer = { areas: c.areas, rooms: c.rooms.filter((r) => r.id !== 'keycloak') }
    const ids = buildNav(fewer).areas.flatMap((a) => a.children.map((l) => l.id))
    expect(ids).not.toContain('keycloak')
  })
})
