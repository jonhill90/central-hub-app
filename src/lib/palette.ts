import type { Nav } from './nav'

export interface PaletteLink { label: string; href: string; group?: string }

/** Every link of the menu as one flat list, each room tagged with its area's name. */
export function flattenNav(nav: Nav): PaletteLink[] {
  return [
    ...nav.top.map((l) => ({ label: l.label, href: l.href })),
    ...nav.areas.flatMap((a) => [
      { label: a.label, href: a.href },
      ...a.children.map((c) => ({ label: c.label, href: c.href, group: a.label })),
    ]),
  ]
}

/** Case-insensitive substring match on the label; labels that start with the query come first. */
export function filterLinks(links: PaletteLink[], query: string): PaletteLink[] {
  const q = query.trim().toLowerCase()
  if (!q) return links
  const hits = links.filter((l) => l.label.toLowerCase().includes(q))
  const starts = hits.filter((l) => l.label.toLowerCase().startsWith(q))
  return [...starts, ...hits.filter((l) => !starts.includes(l))]
}

/** The id of the area group that holds the current page, or null (home, agents, unknown). */
export function groupOpen(nav: Nav, pathname: string): string | null {
  for (const a of nav.areas) {
    if (pathname === a.href || a.children.some((c) => pathname === c.href)) return a.id
  }
  return null
}
