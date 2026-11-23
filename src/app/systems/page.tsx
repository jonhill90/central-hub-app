import Link from 'next/link'
import { Server } from 'lucide-react'
import { hub, type ProxmoxResource } from '@/lib/hub'

export const dynamic = 'force-dynamic'

const gib = (b: number | null) => (b == null ? 'unknown' : `${(b / 2 ** 30).toFixed(1)} GiB`)
const pct = (a: number | null, b: number | null) => (a == null || !b ? 'unknown' : `${Math.round((a / b) * 100)}%`)
const cpu = (r: ProxmoxResource) => (r.cpu == null ? 'unknown' : `${Math.round(r.cpu * 100)}%${r.maxcpu ? ` of ${r.maxcpu}` : ''}`)
const up = (s: number | null) => (s == null ? 'unknown' : s >= 86400 ? `${Math.floor(s / 86400)} d` : s >= 3600 ? `${Math.floor(s / 3600)} h` : `${Math.floor(s / 60)} min`)
const age = (s: number) => (s < 90 ? `${s} s` : s < 5400 ? `${Math.round(s / 60)} min` : `${(s / 3600).toFixed(1)} h`)

function Table({ rows }: { rows: ProxmoxResource[] }) {
  return (
    <table className="sys-table">
      <thead><tr><th>Name</th><th>Node</th><th>Status</th><th>CPU</th><th>Memory</th><th>Disk</th><th>Up</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.name}<br /><small>{r.id}</small></td><td>{r.node}</td>
            <td><span className={`pill ${r.status === 'running' || r.status === 'online' || r.status === 'available' ? 'ok' : ''}`}>{r.status}</span></td>
            <td>{cpu(r)}</td><td>{gib(r.mem)} of {gib(r.maxmem)} ({pct(r.mem, r.maxmem)})</td><td>{gib(r.disk)} of {gib(r.maxdisk)}</td><td>{up(r.uptime)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default async function Systems() {
  const px = await hub().systems.proxmox()
  return (
    <>
      <p><Link href="/">Hub</Link></p>
      <h1><Server size={24} aria-hidden="true" /> Systems</h1>
      <p className="needs">A view of what each system reported, with the time it reported it. It shows and never changes anything.</p>
      <h2>Proxmox</h2>
      {!px.connected ? <p className="needs"><strong>Not connected.</strong> {px.reason}.</p> : (() => {
        const s = px.snapshot
        const vms = s.resources.filter((r) => r.type === 'qemu' || r.type === 'lxc').sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
        const nodes = s.resources.filter((r) => r.type === 'node')
        const stores = s.resources.filter((r) => r.type === 'storage')
        return (
          <>
            <p>As of <time dateTime={s.generatedAt}>{s.generatedAt.replace('T', ' ').slice(0, 16)} UTC</time> ({age(s.ageSeconds)} ago).{s.stale && <strong> This snapshot is old: the feed may have stopped.</strong>}{' '}
              {vms.filter((v) => v.status === 'running').length} of {vms.length} guests running.</p>
            {nodes.length > 0 && (<><h3>Nodes</h3><Table rows={nodes} /></>)}
            <h3>Guests</h3>{vms.length ? <Table rows={vms} /> : <p>The snapshot lists no guests.</p>}
            {stores.length > 0 && (<><h3>Storage</h3><Table rows={stores} /></>)}
          </>
        )
      })()}
    </>
  )
}
