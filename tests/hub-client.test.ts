import { describe, expect, it } from 'vitest'
import { httpHub, localHub } from '@/lib/hub'
import { GET as catalogRoute } from '@/app/api/v1/catalog/route'
import { GET as agentsRoute } from '@/app/api/v1/agents/route'

// The http client talks to the route handlers through a stub fetch, so no server is needed.
const fakeFetch = (async (url: string) => {
  if (url.endsWith('/api/v1/catalog')) return catalogRoute()
  if (url.endsWith('/api/v1/agents')) return agentsRoute()
  return new Response('{}', { status: 404 })
}) as unknown as typeof fetch

describe('hub client', () => {
  const http = httpHub('http://hub.test', fakeFetch)
  it('the http and local clients return equal data for the same catalog', async () => {
    expect(await http.getCatalog()).toEqual(await localHub.getCatalog())
    expect(await http.getAgents()).toEqual(await localHub.getAgents())
  })
  it('the http client throws on an error answer', async () => {
    const bad = httpHub('http://hub.test', (async () => new Response('x', { status: 500 })) as unknown as typeof fetch)
    await expect(bad.getCatalog()).rejects.toThrow('500')
  })
})
