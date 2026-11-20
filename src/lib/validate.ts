import type { Catalog } from './types'

const REQUIRED = ['id', 'name', 'summary', 'owner', 'docs', 'exit_path', 'status'] as const

/** Returns a list of problems; an empty list means the catalog is sound. */
export function validateCatalog(c: Catalog): string[] {
  const problems: string[] = []
  const areaIds = new Set(c.areas.map((a) => a.id))
  const roomIds = new Set(c.rooms.map((r) => r.id))
  const seen = new Set<string>()
  for (const rec of [...c.areas, ...c.rooms]) {
    for (const f of REQUIRED) {
      if (!rec[f] || String(rec[f]).trim() === '') problems.push(`${rec.id || '?'}: missing ${f}`)
    }
    if (rec.docs && !/^https:\/\//.test(rec.docs)) problems.push(`${rec.id}: docs must be an https link`)
  }
  for (const id of [...c.areas, ...c.rooms].map((r) => r.id)) {
    if (seen.has(id)) problems.push(`${id}: duplicate id`)
    seen.add(id)
  }
  for (const r of c.rooms) {
    if (!areaIds.has(r.area)) problems.push(`${r.id}: unknown area ${r.area}`)
    for (const l of r.links) if (!roomIds.has(l)) problems.push(`${r.id}: link to unknown room ${l}`)
  }
  return problems
}
