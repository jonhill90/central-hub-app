// The ONE client pages use for data. Two implementations behind one interface:
//   local: reads through catalog.ts and agents.ts (the default)
//   http:  calls a backend described by the OpenAPI file in openapi/, at HUB_API_URL
// Swapping the backend means setting HUB_API_MODE=http and HUB_API_URL; the
// backend must pass `npm run contract`.
import { getCatalog as readCatalog } from './catalog'
import { getAgents as readAgents } from './agents'
import type { Catalog } from './types'
import type { AgentView } from './sheet'

export interface HubApi {
  getCatalog(): Promise<Catalog>
  getAgents(): Promise<AgentView[]>
}

export const localHub: HubApi = {
  getCatalog: async () => readCatalog(),
  getAgents: async () => readAgents(),
}

export function httpHub(baseUrl: string, fetchFn: typeof fetch = fetch): HubApi {
  const base = baseUrl.replace(/\/$/, '')
  async function get<T>(path: string): Promise<T> {
    const res = await fetchFn(base + path, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Hub API ${path} answered ${res.status}`)
    return (await res.json()) as T
  }
  return {
    getCatalog: () => get<Catalog>('/api/v1/catalog'),
    getAgents: async () => (await get<{ agents: AgentView[] }>('/api/v1/agents')).agents,
  }
}

export function hub(): HubApi {
  if (process.env.HUB_API_MODE === 'http') {
    const url = process.env.HUB_API_URL
    if (!url) throw new Error('HUB_API_MODE=http needs HUB_API_URL')
    return httpHub(url)
  }
  return localHub
}
