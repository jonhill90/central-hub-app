import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hub, NotebookError } from '@/lib/hub'
import { noteHref } from '@/lib/notebook-render'
import { NotebookSearch } from '@/components/NotebookSearch'
import { FolderBody } from '@/components/NotebookList'

export const dynamic = 'force-dynamic'

function crumbs(p: string) {
  const parts = p.split('/')
  return parts.slice(0, -1).map((name, i) => ({ name, href: noteHref(parts.slice(0, i + 1).join('/')) }))
}

export default async function NotebookPath({ params }: { params: Promise<{ path: string[] }> }) {
  const rel = (await params).path.map(decodeURIComponent).join('/')
  const st = await hub().notebook.state()
  if (!st.connected) notFound()
  try {
    const trail = (
      <p><Link href="/">Hub</Link> / <Link href="/notebook">Notebook</Link>{crumbs(rel).map((c) => <span key={c.href}> / <Link href={c.href}>{c.name}</Link></span>)}</p>
    )
    if (rel.endsWith('.md')) {
      const n = await hub().notebook.note(rel)
      return (
        <>
          {trail}
          <h1>{n.title}</h1>
          {n.description && <p className="needs">{n.description}</p>}
          {n.properties.length > 0 && (
            <details className="nb-props"><summary>Properties</summary>
              <dl>{n.properties.map((p) => (<div key={p.key} style={{ display: 'contents' }}><dt>{p.key}</dt><dd>{p.value}</dd></div>))}</dl>
            </details>
          )}
          <article className="nb-note" dangerouslySetInnerHTML={{ __html: n.html }} />
          <p><small>{n.path}</small></p>
        </>
      )
    }
    const f = await hub().notebook.folder(rel)
    return (<>{trail}<h1>{rel.split('/').pop()}/</h1><NotebookSearch /><FolderBody f={f} /></>)
  } catch (e) {
    if (e instanceof NotebookError && (e.status === 404 || e.status === 400)) notFound()
    throw e
  }
}
