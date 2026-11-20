import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAgents } from '@/lib/agents'

export const dynamic = 'force-dynamic'

export default async function AgentPage({ params }: { params: Promise<{ agent: string }> }) {
  const { agent: id } = await params
  const agent = getAgents().find((a) => a.id === id)
  if (!agent) notFound()
  return (
    <>
      <p><Link href="/">Hub</Link> / <Link href="/agents">Agents</Link></p>
      <h1>{agent.name}</h1>
      <p className="needs">This sheet shows what the agent is <strong>meant to be</strong>, not what it is running as. Authority is a ceiling: the effective permission is the intersection with the dispatch record and the session policy, so it can only be narrower. Unknown stays unknown.</p>
      {agent.sections.map((s) => (
        <section key={s.title}>
          <h2>{s.title}</h2>
          <dl>
            {s.fields.map((f) => (
              <div key={f.label} style={{ display: 'contents' }}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      {agent.notes && <section><h2>Notes</h2><pre style={{ whiteSpace: 'pre-wrap', font: 'inherit' }}>{agent.notes}</pre></section>}
    </>
  )
}
