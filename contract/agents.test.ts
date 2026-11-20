import { describe, expect, it } from 'vitest'
import { BASE, validator } from './schema'

describe('GET /api/v1/agents', () => {
  it('answers 200 with a body valid against the agents schema, each agent having ten sections', async () => {
    const res = await fetch(BASE + '/api/v1/agents')
    expect(res.status).toBe(200)
    const body = await res.json()
    const r = validator('Agents')(body)
    expect(r.errors).toEqual([])
    expect(r.ok).toBe(true)
    for (const a of body.agents) expect(a.sections).toHaveLength(10)
  })
})
