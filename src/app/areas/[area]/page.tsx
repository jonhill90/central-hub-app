import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hub } from '@/lib/hub'
import { StatusBadge } from '@/components/StatusBadge'

export const dynamic = 'force-dynamic'

export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area: id } = await params
  const { areas, rooms } = await hub().getCatalog()
  const area = areas.find((a) => a.id === id)
  if (!area) notFound()
  return (
    <>
      <p><Link href="/">Hub</Link></p>
      <h1>{area.name}</h1>
      <p>{area.summary}</p>
      <dl>
        <dt>Status</dt><dd><StatusBadge status={area.status} /></dd>
        <dt>Owner</dt><dd>{area.owner}</dd>
        <dt>Docs</dt><dd><a href={area.docs}>{area.docs}</a></dd>
        <dt>Exit path</dt><dd>{area.exit_path}</dd>
      </dl>
      <h2>Rooms</h2>
      <div className="grid">
        {rooms.filter((r) => r.area === id).map((r) => (
          <article className="card" key={r.id}>
            <h3><Link href={`/rooms/${r.id}`}>{r.name}</Link></h3>
            <p>{r.summary}</p>
            <StatusBadge status={r.status} />
          </article>
        ))}
      </div>
    </>
  )
}
