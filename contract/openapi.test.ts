import { describe, expect, it } from 'vitest'
import { spec } from './schema'

describe('openapi/hub-api.yaml', () => {
  it('is OpenAPI 3.1 and defines exactly the read-only operations', () => {
    expect(spec.openapi).toMatch(/^3\.1\./)
    expect(Object.keys(spec.paths).sort()).toEqual(['/api/v1/agents', '/api/v1/catalog', '/api/v1/notebook', '/api/v1/notebook/folder', '/api/v1/notebook/note', '/api/v1/notebook/search'])
    for (const ops of Object.values(spec.paths)) expect(Object.keys(ops)).toEqual(['get'])
  })
})
