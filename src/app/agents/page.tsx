import Link from 'next/link'
import { hub } from '@/lib/hub'

export const dynamic = 'force-dynamic'

export default async function Agents() {
  const agents = await hub().getAgents()
  return (
    <>
      <p><Link href="/">Hub</Link></p>
      <h1>Agents</h1>
      <p className="needs">Sheets show what an agent is <strong>meant to be</strong>, not what it is running as. Unknown values are shown as unknown.</p>
      <div className="grid">
        {agents.map((a) => (
          <article className="card" key={a.id}>
            <h3><Link href={`/agents/${a.id}`}>{a.name}</Link></h3>
            <p>{a.purpose}</p>
            <small>revision {a.revision}</small>
          </article>
        ))}
      </div>
    </>
  )
}
