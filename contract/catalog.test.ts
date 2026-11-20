import { describe, expect, it } from 'vitest'
import { BASE, validator } from './schema'

describe('GET /api/v1/catalog', () => {
  it('answers 200 with a body valid against the catalog schema', async () => {
    const res = await fetch(BASE + '/api/v1/catalog')
    expect(res.status).toBe(200)
    const r = validator('Catalog')(await res.json())
    expect(r.errors).toEqual([])
    expect(r.ok).toBe(true)
  })
})
