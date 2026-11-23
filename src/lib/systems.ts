// Live system snapshots (spec 0011). A snapshot is a JSON file the platform writes into HUB_FEED_DIR
// (default /var/run/hub/feed); the app only reads it and says how old it is. Nothing here calls Proxmox
// or any other system, and nothing here can change one: what the page shows is what the snapshot said.
import { readFileSync } from 'node:fs'
import path from 'node:path'

export interface ProxmoxResource {
  type: 'node' | 'qemu' | 'lxc' | 'storage'
  id: string
  name: string
  node: string
  status: string
  cpu: number | null      // fraction of maxcpu, 0..1
  maxcpu: number | null
  mem: number | null      // bytes
  maxmem: number | null
  disk: number | null
  maxdisk: number | null
  uptime: number | null   // seconds
}
export interface ProxmoxSnapshot { generatedAt: string; ageSeconds: number; stale: boolean; partial: boolean; resources: ProxmoxResource[] }
export type SnapshotState<T> = { connected: false; reason: string } | ({ connected: true } & T)

export const STALE_AFTER_SECONDS = 2 * 3600
const TYPES = new Set(['node', 'qemu', 'lxc', 'storage'])
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null)
const text = (v: unknown, max = 120): string => (typeof v === 'string' ? v.slice(0, max) : '')

/** Keep only the fields the page shows, with their types checked; a record that is not a resource is dropped. */
export function parseProxmox(raw: string, now: number = Date.now()): SnapshotState<{ snapshot: ProxmoxSnapshot }> {
  let j: unknown
  try { j = JSON.parse(raw) } catch { return { connected: false, reason: 'the Proxmox snapshot is not valid JSON' } }
  const o = j as { generatedAt?: unknown; resources?: unknown; source?: unknown }
  const t = typeof o?.generatedAt === 'string' ? Date.parse(o.generatedAt) : NaN
  if (!Array.isArray(o?.resources) || Number.isNaN(t)) return { connected: false, reason: 'the Proxmox snapshot has no generatedAt or resources' }
  const resources: ProxmoxResource[] = []
  for (const r of o.resources as Record<string, unknown>[]) {
    if (!r || typeof r !== 'object' || !TYPES.has(String(r.type))) continue
    resources.push({
      type: r.type as ProxmoxResource['type'], id: text(r.id), name: text(r.name) || text(r.id), node: text(r.node), status: text(r.status) || 'unknown',
      cpu: num(r.cpu), maxcpu: num(r.maxcpu), mem: num(r.mem), maxmem: num(r.maxmem), disk: num(r.disk), maxdisk: num(r.maxdisk), uptime: num(r.uptime),
    })
  }
  const ageSeconds = Math.max(0, Math.round((now - t) / 1000))
  return { connected: true, snapshot: { generatedAt: new Date(t).toISOString(), ageSeconds, stale: ageSeconds > STALE_AFTER_SECONDS, partial: o.source === 'proxmox-dev', resources } }
}

export function getProxmox(now: number = Date.now()): SnapshotState<{ snapshot: ProxmoxSnapshot }> {
  if (!(process.env.HUB_AUTH === 'oidc' || process.env.HUB_ALLOW_OPEN_DATA === 'yes')) return { connected: false, reason: 'the systems view is closed: sign-in is off' }
  const dir = process.env.HUB_FEED_DIR || '/var/run/hub/feed'
  let raw = ''
  try { raw = readFileSync(path.join(dir, 'proxmox.json'), 'utf8') } catch { return { connected: false, reason: 'no Proxmox snapshot has been delivered to the app yet' } }
  return parseProxmox(raw, now)
}
