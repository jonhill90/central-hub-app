import Link from 'next/link'
import { hub } from '@/lib/hub'
import { NotebookSearch } from '@/components/NotebookSearch'
import { NoteRows } from '@/components/NotebookList'

export const dynamic = 'force-dynamic'

export default async function Results({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').slice(0, 200)
  const st = await hub().notebook.state()
  const notes = st.connected && q.trim() ? await hub().notebook.search(q) : []
  return (
    <>
      <p><Link href="/">Hub</Link> / <Link href="/notebook">Notebook</Link></p>
      <h1>Search</h1>
      <NotebookSearch q={q} />
      {!st.connected ? <p className="needs">No notebook is connected. {st.reason}.</p>
        : !q.trim() ? <p>Type a word or two.</p>
        : notes.length === 0 ? <p>No note matches every word of &ldquo;{q}&rdquo;.</p>
        : (<><p>{notes.length}{notes.length === 40 ? '+' : ''} match{notes.length === 1 ? '' : 'es'}, best first.</p><NoteRows notes={notes} /></>)}
    </>
  )
}
