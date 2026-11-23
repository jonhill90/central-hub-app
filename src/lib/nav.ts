import type { Catalog } from './types'

export interface NavLink { id: string; label: string; href: string }
export interface NavGroup { id: string; label: string; href: string; children: NavLink[] }
export interface Nav { top: NavLink[]; areas: NavGroup[] }

/** The side menu, built only from the catalog: a room with no record has no link. */
export function buildNav(c: Catalog): Nav {
  return {
    top: [
      { id: 'hub', label: 'Hub', href: '/' },
      { id: 'agents', label: 'Agents', href: '/agents' },
      { id: 'notebook', label: 'Notebook', href: '/notebook' },
      { id: 'systems', label: 'Systems', href: '/systems' },
    ],
    areas: c.areas.map((a) => ({
      id: a.id,
      label: a.name,
      href: `/areas/${a.id}`,
      children: c.rooms.filter((r) => r.area === a.id).map((r) => ({ id: r.id, label: r.name, href: `/rooms/${r.id}` })),
    })),
  }
}
