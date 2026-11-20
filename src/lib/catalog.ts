// The ONE module that reads the catalog files. Everything else calls
// getCatalog(). To replace the source (an API, a database, a Rust service),
// change this file only; tests/seam.test.ts enforces that.
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import type { Area, Catalog, Room } from './types'
import { validateCatalog } from './validate'

const DIR = process.env.CATALOG_DIR ?? path.join(process.cwd(), 'catalog')

export function loadCatalog(dir: string = DIR): Catalog {
  const areas = parse(readFileSync(path.join(dir, 'areas.yaml'), 'utf8')) as Area[]
  const roomDir = path.join(dir, 'rooms')
  const rooms = readdirSync(roomDir)
    .filter((f) => f.endsWith('.yaml'))
    .sort()
    .map((f) => {
      const r = parse(readFileSync(path.join(roomDir, f), 'utf8')) as Room
      return { ...r, links: r.links ?? [] }
    })
  const catalog = { areas, rooms }
  const problems = validateCatalog(catalog)
  if (problems.length) throw new Error('Catalog is not valid:\n' + problems.join('\n'))
  return catalog
}

export function getCatalog(): Catalog {
  return loadCatalog()
}
