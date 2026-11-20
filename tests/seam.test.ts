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

describe('the catalog seam', () => {
  it('only src/lib/catalog.ts imports node:fs or reads the catalog folder', () => {
    const offenders = files.filter((f) => f !== path.join('src', 'lib', 'catalog.ts'))
      .filter((f) => /from ['"](node:)?fs['"]|from ['"](node:)?fs\/promises['"]|catalog\/|\.yaml/.test(readFileSync(f, 'utf8')))
    expect(offenders).toEqual([])
  })
  it('no component imports fs, a database driver or uses a server action', () => {
    const offenders = files.filter((f) => f.includes(path.join('src', 'components')))
      .filter((f) => /['"]use server['"]|from ['"](node:)?fs|from ['"](pg|mysql2?|sqlite3|better-sqlite3|mongodb)['"]/.test(readFileSync(f, 'utf8')))
    expect(offenders).toEqual([])
  })
})
