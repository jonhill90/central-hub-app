import { describe, expect, it } from 'vitest'
import { buildNav } from '@/lib/nav'
import { filterLinks, flattenNav, groupOpen } from '@/lib/palette'
import { loadCatalog } from '@/lib/catalog'

const nav = buildNav(loadCatalog())
const links = flattenNav(nav)

describe('command palette matching', () => {
  it('an empty query returns every link (req 1)', () => {
    expect(filterLinks(links, '')).toHaveLength(links.length)
    expect(filterLinks(links, '   ')).toHaveLength(links.length)
  })
  it('matches case-insensitively and ranks prefix matches first (req 1)', () => {
    const sample = [
      { label: 'Backups', href: '/a' }, { label: 'Notebook backups', href: '/b' }, { label: 'Hub', href: '/' },
    ]
    expect(filterLinks(sample, 'BACK').map((l) => l.label)).toEqual(['Backups', 'Notebook backups'])
  })
  it('returns nothing for no match, and only links from the nav (req 2)', () => {
    expect(filterLinks(links, 'zzzzqqqq')).toEqual([])
    for (const l of filterLinks(links, 'a')) expect(links).toContain(l)
  })
})

describe('which menu group is open', () => {
  it('opens the group of the current room or area, none on home (req 3)', () => {
    const a = nav.areas.find((x) => x.children.length > 0)!
    expect(groupOpen(nav, a.href)).toBe(a.id)
    expect(groupOpen(nav, a.children[0].href)).toBe(a.id)
    expect(groupOpen(nav, '/')).toBeNull()
    expect(groupOpen(nav, '/agents')).toBeNull()
  })
})
