import { describe, expect, it } from 'vitest'
import { BASE, validator } from './schema'

describe('GET /api/v1/systems/proxmox', () => {
  it('answers 200 with a state valid against the schema (a snapshot, or connected false and why)', async () => {
    const res = await fetch(BASE + '/api/v1/systems/proxmox')
    expect(res.status).toBe(200)
    const r = validator('ProxmoxState')(await res.json())
    expect(r.errors).toEqual([])
    expect(r.ok).toBe(true)
  })
})
