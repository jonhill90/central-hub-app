import { describe, expect, it } from 'vitest'
import { BASE } from './schema'

describe('errors', () => {
  it('answers 404 for an unknown path under /api/v1/', async () => {
    expect((await fetch(BASE + '/api/v1/nothing-here')).status).toBe(404)
  })
  it('answers 405 for a non-GET method on a known path', async () => {
    expect((await fetch(BASE + '/api/v1/catalog', { method: 'POST' })).status).toBe(405)
    expect((await fetch(BASE + '/api/v1/agents', { method: 'DELETE' })).status).toBe(405)
  })
})
