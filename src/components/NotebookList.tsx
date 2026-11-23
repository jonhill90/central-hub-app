import Link from 'next/link'
import { Folder, FileText } from 'lucide-react'
import type { FolderView, NoteMeta } from '@/lib/hub'
import { noteHref } from '@/lib/notebook-render'

export function NoteRows({ notes }: { notes: NoteMeta[] }) {
  return (
    <ul className="nb-list">
      {notes.map((n) => (
        <li key={n.path}>
          <FileText size={16} aria-hidden="true" />
          <div>
            <Link href={noteHref(n.path)}>{n.title}</Link>
            {n.description && <p>{n.description}</p>}
            <small>{n.path}{n.tags.length ? ` · ${n.tags.join(', ')}` : ''}</small>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function FolderBody({ f }: { f: FolderView }) {
  return (
    <>
      {f.folders.length > 0 && (
        <ul className="nb-list nb-folders">
          {f.folders.map((d) => (
            <li key={d.path}><Folder size={16} aria-hidden="true" /><div><Link href={noteHref(d.path)}>{d.name}/</Link></div></li>
          ))}
        </ul>
      )}
      {f.notes.length > 0 ? <NoteRows notes={f.notes} /> : f.folders.length === 0 && <p>This folder is empty.</p>}
    </>
  )
}
