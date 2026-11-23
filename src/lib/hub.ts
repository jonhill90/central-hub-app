// The ONE client pages use for data. Two implementations behind one interface:
//   local: reads through catalog.ts and agents.ts (the default)
//   http:  calls a backend described by the OpenAPI file in openapi/, at HUB_API_URL
// Swapping the backend means setting HUB_API_MODE=http and HUB_API_URL; the
// backend must pass `npm run contract`.
import { getCatalog as readCatalog } from './catalog'
import { getAgents as readAgents } from './agents'
import type { Catalog } from './types'
import type { AgentView } from './sheet'
import * as nb from './notebook'
import { getProxmox, type ProxmoxSnapshot, type SnapshotState } from './systems'
import type { FolderView, NoteMeta, NoteView, NotebookState } from './notebook'

export type { FolderView, NoteMeta, NoteView, NotebookState }
export { NotebookError } from './notebook'
export type { ProxmoxResource, ProxmoxSnapshot, SnapshotState } from './systems'

export interface HubApi {
  getCatalog(): Promise<Catalog>
  getAgents(): Promise<AgentView[]>
  systems: { proxmox(): Promise<SnapshotState<{ snapshot: ProxmoxSnapshot }>> }
  notebook: {
    state(): Promise<NotebookState>
    folder(path: string): Promise<FolderView>
    note(path: string): Promise<NoteView>
    search(q: string): Promise<NoteMeta[]>
  }
}

export const localHub: HubApi = {
  getCatalog: async () => readCatalog(),
  getAgents: async () => readAgents(),
  systems: { proxmox: async () => getProxmox() },
  notebook: {
    state: async () => nb.state(),
    folder: async (p) => nb.getFolder(p),
    note: async (p) => nb.getNote(p),
    search: async (q) => nb.search(q),
  },
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
    systems: { proxmox: () => get<SnapshotState<{ snapshot: ProxmoxSnapshot }>>('/api/v1/systems/proxmox') },
    notebook: {
      state: () => get<NotebookState>('/api/v1/notebook'),
      folder: (p) => get<FolderView>('/api/v1/notebook/folder?path=' + encodeURIComponent(p)),
      note: (p) => get<NoteView>('/api/v1/notebook/note?path=' + encodeURIComponent(p)),
      search: async (q) => (await get<{ notes: NoteMeta[] }>('/api/v1/notebook/search?q=' + encodeURIComponent(q))).notes,
    },
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
