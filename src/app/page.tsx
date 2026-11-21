import Link from 'next/link'
import { Bot, Boxes, DoorOpen, PauseCircle } from 'lucide-react'
import { hub } from '@/lib/hub'
import { StatusBadge } from '@/components/StatusBadge'
import { areaIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

const rooms = (n: number) => (n === 1 ? '1 room' : `${n} rooms`)

export default async function Hub() {
  const { areas, rooms: allRooms } = await hub().getCatalog()
  const agents = await hub().getAgents()
  const tiles = [
    { label: 'Areas', n: areas.length, Icon: Boxes },
    { label: 'Rooms', n: allRooms.length, Icon: DoorOpen },
    { label: 'Agents', n: agents.length, Icon: Bot },
    { label: 'Parked', n: [...areas, ...allRooms].filter((x) => x.status === 'parked').length, Icon: PauseCircle },
  ]
  return (
    <>
      <h1>Hub</h1>
      <div className="tiles">
        {tiles.map(({ label, n, Icon }) => (
          <div className="tile" key={label}>
            <div className="head"><span className="icon-box"><Icon size={20} aria-hidden="true" /></span>{label}</div>
            <div className="n">{n}</div>
          </div>
        ))}
      </div>
      <div className="actions">
        <Link className="btn primary" href="/agents"><Bot size={16} aria-hidden="true" />See agents</Link>
      </div>
      <p className="needs"><strong>Needs Jon:</strong> nothing is connected yet, so nothing is waiting. Status will show here once rooms report it.</p>
      <h2>Areas</h2>
      <div className="grid">
        {areas.map((a) => {
          const Icon = areaIcon(a.id)
          return (
            <article className="card" key={a.id}>
              <div className="head"><span className="icon-box"><Icon size={20} aria-hidden="true" /></span><h3><Link href={`/areas/${a.id}`}>{a.name}</Link></h3></div>
              <p>{a.summary}</p>
              <StatusBadge status={a.status} /> <small>{rooms(allRooms.filter((r) => r.area === a.id).length)}</small>
            </article>
          )
        })}
      </div>
    </>
  )
}
