import Link from 'next/link'
import { getCatalog } from '@/lib/catalog'
import { StatusBadge } from '@/components/StatusBadge'

export const dynamic = 'force-dynamic'

export default function Hub() {
  const { areas, rooms } = getCatalog()
  return (
    <>
      <h1>Hub</h1>
      <p className="needs"><strong>Needs Jon:</strong> nothing is connected yet, so nothing is waiting. Status will show here once rooms report it.</p>
      <div className="grid">
        {areas.map((a) => (
          <article className="card" key={a.id}>
            <h3><Link href={`/areas/${a.id}`}>{a.name}</Link></h3>
            <p>{a.summary}</p>
            <StatusBadge status={a.status} /> <small>{rooms.filter((r) => r.area === a.id).length === 1 ? "1 room" : `${rooms.filter((r) => r.area === a.id).length} rooms`}</small>
          </article>
        ))}
      </div>
    </>
  )
}
