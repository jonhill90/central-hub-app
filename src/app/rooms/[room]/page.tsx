import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hub } from '@/lib/hub'
import { StatusBadge } from '@/components/StatusBadge'

export const dynamic = 'force-dynamic'

export default async function RoomPage({ params }: { params: Promise<{ room: string }> }) {
  const { room: id } = await params
  const { areas, rooms } = await hub().getCatalog()
  const room = rooms.find((r) => r.id === id)
  if (!room) notFound()
  const area = areas.find((a) => a.id === room.area)!
  const connected = rooms.filter((r) => room.links.includes(r.id) || r.links.includes(room.id))
  return (
    <>
      <p><Link href="/">Hub</Link> / <Link href={`/areas/${area.id}`}>{area.name}</Link></p>
      <h1>{room.name}</h1>
      <p>{room.summary}</p>
      <dl>
        <dt>Status</dt><dd><StatusBadge status={room.status} /></dd>
        <dt>Owner</dt><dd>{room.owner}</dd>
        <dt>Docs</dt><dd><a href={room.docs}>{room.docs}</a></dd>
        <dt>Exit path</dt><dd>{room.exit_path}</dd>
      </dl>
      <h2>Connected to</h2>
      {connected.length === 0 ? <p>Nothing listed.</p> : (
        <ul>{connected.map((r) => <li key={r.id}><Link href={`/rooms/${r.id}`}>{r.name}</Link></li>)}</ul>
      )}
    </>
  )
}
