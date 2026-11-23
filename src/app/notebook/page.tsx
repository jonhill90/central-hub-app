import Link from 'next/link'
import { hub } from '@/lib/hub'
import { NotebookSearch } from '@/components/NotebookSearch'
import { FolderBody } from '@/components/NotebookList'

export const dynamic = 'force-dynamic'

export default async function Notebook() {
  const st = await hub().notebook.state()
  if (!st.connected) {
    return (
      <>
        <p><Link href="/">Hub</Link></p>
        <h1>Notebook</h1>
        <p className="needs"><strong>No notebook is connected.</strong> {st.reason}. The platform puts a checkout of the agents&apos; notebook where the app can read it; until then there is nothing to show, and this page shows nothing instead of a link to GitHub.</p>
      </>
    )
  }
  const root = await hub().notebook.folder('')
  return (
    <>
      <p><Link href="/">Hub</Link></p>
      <h1>Notebook</h1>
      <p>{st.notes.toLocaleString('en-US')} notes, read from the notebook&apos;s own files.{root.index && <> Start at the <Link href={`/notebook/${root.index}`}>README</Link>.</>}</p>
      <NotebookSearch />
      <FolderBody f={root} />
    </>
  )
}
