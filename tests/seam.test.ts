import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}
const files = walk('src').filter((f) => /\.(ts|tsx)$/.test(f))

describe('the data seam', () => {
  it('pages import data only from src/lib/hub.ts; only hub.ts imports the readers', () => {
    const importers = files.filter((f) => /from ['"]@\/lib\/(catalog|agents)['"]|from ['"]\.\/(catalog|agents)['"]/.test(readFileSync(f, 'utf8')))
    expect(importers).toEqual([path.join('src', 'lib', 'hub.ts')])
  })

  it('only src/lib/catalog.ts and src/lib/agents.ts import node:fs or read the catalog folders', () => {
    // config.ts reads the sign-in files the platform mounts (spec 0007); it never touches the catalog.
    const readers = [path.join('src', 'lib', 'catalog.ts'), path.join('src', 'lib', 'agents.ts'), path.join('src', 'lib', 'auth', 'config.ts')]
    const offenders = files.filter((f) => !readers.includes(f))
      .filter((f) => /from ['"](node:)?fs['"]|from ['"](node:)?fs\/promises['"]|catalog\/|\.yaml/.test(readFileSync(f, 'utf8')))
    expect(offenders).toEqual([])
  })
  it('no component imports fs, a database driver or uses a server action', () => {
    const offenders = files.filter((f) => f.includes(path.join('src', 'components')))
      .filter((f) => /['"]use server['"]|from ['"](node:)?fs|from ['"](pg|mysql2?|sqlite3|better-sqlite3|mongodb)['"]/.test(readFileSync(f, 'utf8')))
    expect(offenders).toEqual([])
  })
})
