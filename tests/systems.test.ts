import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { getProxmox, parseProxmox } from '@/lib/systems'

const NOW = Date.parse('2026-11-23T01:00:00Z')
const snap = (extra: object = {}) => JSON.stringify({ generatedAt: '2026-11-23T00:50:00Z', resources: [
  { type: 'qemu', id: 'qemu/258', name: 'agentbox', node: 'pve', status: 'running', cpu: 0.12, maxcpu: 4, mem: 2147483648, maxmem: 8589934592, uptime: 90000, token: 'sk-secret' },
  { type: 'cluster', id: 'x' }, { type: 'node', id: 'node/pve', node: 'pve', status: 'online', cpu: 'lots' }, ...[] ], ...extra })

describe('systems feed (spec 0011)', () => {
  afterEach(() => { delete process.env.HUB_FEED_DIR; delete process.env.HUB_ALLOW_OPEN_DATA; delete process.env.HUB_AUTH })
  it('keeps only known fields with checked types, and drops records that are not resources', () => {
    const r = parseProxmox(snap(), NOW)
    if (!r.connected) throw new Error('expected connected')
    expect(r.snapshot.resources.map((x) => x.id)).toEqual(['qemu/258', 'node/pve'])
    expect(r.snapshot.resources[0]).toEqual({ type: 'qemu', id: 'qemu/258', name: 'agentbox', node: 'pve', status: 'running', cpu: 0.12, maxcpu: 4, mem: 2147483648, maxmem: 8589934592, disk: null, maxdisk: null, uptime: 90000 })
    expect(JSON.stringify(r)).not.toContain('sk-secret')
    expect(r.snapshot.resources[1].cpu).toBeNull()
  })
  it('says how old the snapshot is and when it is stale', () => {
    const fresh = parseProxmox(snap(), NOW); const old = parseProxmox(snap(), NOW + 3 * 3600_000)
    expect(fresh.connected && fresh.snapshot.ageSeconds).toBe(600)
    expect(fresh.connected && fresh.snapshot.stale).toBe(false)
    expect(old.connected && old.snapshot.stale).toBe(true)
  })
  it('flags a snapshot read with the dev token as partial', () => {
    const dev = parseProxmox(snap({ source: 'proxmox-dev' }), NOW); const lab = parseProxmox(snap({ source: 'proxmox-lab' }), NOW)
    expect(dev.connected && dev.snapshot.partial).toBe(true)
    expect(lab.connected && lab.snapshot.partial).toBe(false)
    expect(parseProxmox(snap(), NOW).connected && (parseProxmox(snap(), NOW) as { snapshot: { partial: boolean } }).snapshot.partial).toBe(false)
  })
  it('a snapshot that is not JSON or has no time says so instead of showing anything', () => {
    expect(parseProxmox('nope', NOW)).toEqual({ connected: false, reason: expect.stringContaining('not valid JSON') })
    expect(parseProxmox('{"resources":[]}', NOW)).toEqual({ connected: false, reason: expect.stringContaining('generatedAt') })
  })
  it('reads proxmox.json from HUB_FEED_DIR, and is closed while sign-in is off', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'feed-')); writeFileSync(path.join(dir, 'proxmox.json'), snap())
    process.env.HUB_FEED_DIR = dir
    expect(getProxmox(NOW)).toEqual({ connected: false, reason: expect.stringContaining('sign-in is off') })
    process.env.HUB_AUTH = 'oidc'
    expect(getProxmox(NOW).connected).toBe(true)
    process.env.HUB_FEED_DIR = path.join(dir, 'missing')
    expect(getProxmox(NOW)).toEqual({ connected: false, reason: expect.stringContaining('no Proxmox snapshot') })
  })
})
