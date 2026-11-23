// The notebook reader: the only module that reads the notebook checkout (spec 0010). The checkout is a folder
// of markdown notes at HUB_NOTEBOOK_DIR; the platform puts it there. Read-only: nothing here writes a file.
// Paths are relative to the root; anything that climbs out of it, or is not a note or a folder, is refused.
import { readdirSync, readFileSync, realpathSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { renderNote, type LinkResolver } from './notebook-render'

export interface NoteMeta { path: string; title: string; description: string; tags: string[] }
export interface FolderView { path: string; folders: { name: string; path: string }[]; notes: NoteMeta[]; index: string | null }
export interface NoteView { path: string; title: string; description: string; properties: { key: string; value: string }[]; html: string; up: string }
export type NotebookState = { connected: false; reason: string } | { connected: true; notes: number }

const HIDDEN = new Set(['.git', '.cache', '.github', '.obsidian', 'node_modules', '__pycache__', '.trash'])
const root = (): string => process.env.HUB_NOTEBOOK_DIR ?? ''

export class NotebookError extends Error { constructor(public status: 400 | 404 | 503, message: string) { super(message) } }

/** Private data is served only behind sign-in: with HUB_AUTH off the notebook stays closed (HUB_ALLOW_OPEN_DATA=yes is for tests and a laptop). */
export const dataAllowed = (): boolean => process.env.HUB_AUTH === 'oidc' || process.env.HUB_ALLOW_OPEN_DATA === 'yes'

function base(): string {
  if (!dataAllowed()) throw new NotebookError(503, 'the notebook is closed: sign-in is off, and the notebook is private')
  const r = root()
  if (!r) throw new NotebookError(503, 'the notebook is not connected: HUB_NOTEBOOK_DIR is not set')
  try { return realpathSync(r) } catch { throw new NotebookError(503, 'the notebook is not connected: its folder is not there') }
}

/** Resolve a request path to a real path inside the root, or throw. `kind` says what it must be. */
function safe(rel: string, kind: 'file' | 'dir'): { abs: string; rel: string } {
  const clean = rel.replace(/^\/+|\/+$/g, '')
  if (clean.includes('\0') || clean.split('/').some((s) => s === '..' || (s.startsWith('.') && s !== '') || HIDDEN.has(s))) throw new NotebookError(400, 'bad path')
  const b = base()
  const abs = path.join(b, clean)
  let real: string
  try { real = realpathSync(abs) } catch { throw new NotebookError(404, 'not found') }
  if (real !== b && !real.startsWith(b + path.sep)) throw new NotebookError(400, 'bad path')
  const st = statSync(real)
  if (kind === 'file' && !(st.isFile() && real.endsWith('.md'))) throw new NotebookError(404, 'not found')
  if (kind === 'dir' && !st.isDirectory()) throw new NotebookError(404, 'not found')
  return { abs: real, rel: clean }
}

function split(src: string): { fm: Record<string, unknown>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src)
  if (!m) return { fm: {}, body: src }
  let fm: unknown = {}
  try { fm = parse(m[1]) } catch { /* a note whose front matter does not parse is still shown, without properties */ }
  return { fm: fm && typeof fm === 'object' && !Array.isArray(fm) ? (fm as Record<string, unknown>) : {}, body: src.slice(m[0].length) }
}

const str = (v: unknown): string => (v == null ? '' : Array.isArray(v) ? v.map(String).join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v))
const heading = (body: string): string => /^#\s+(.+)$/m.exec(body)?.[1]?.trim() ?? ''

function meta(rel: string, src: string): NoteMeta {
  const { fm, body } = split(src)
  const title = str(fm.title) || heading(body) || path.posix.basename(rel, '.md')
  const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : []
  return { path: rel, title, description: str(fm.description), tags }
}

// The index of every note, built once and kept for 5 minutes (a checkout of ~5,500 notes reads in about a second).
interface Index { at: number; root: string; notes: NoteMeta[]; byPath: Set<string>; byName: Map<string, string> }
let cached: Index | null = null
export function resetIndex(): void { cached = null }

function walk(dir: string, rel: string, out: NoteMeta[]): void {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || HIDDEN.has(e.name)) continue
    const r = rel ? `${rel}/${e.name}` : e.name
    if (e.isDirectory()) walk(path.join(dir, e.name), r, out)
    else if (e.isFile() && e.name.endsWith('.md')) {
      let head = ''
      try { head = readFileSync(path.join(dir, e.name), 'utf8').slice(0, 4096) } catch { /* skip an unreadable file */ }
      out.push(meta(r, head))
    }
  }
}

export function index(now: number = Date.now()): Index {
  const b = base()
  if (cached && cached.root === b && now - cached.at < 5 * 60_000) return cached
  const notes: NoteMeta[] = []
  walk(b, '', notes)
  const byName = new Map<string, string>()
  for (const n of notes) {
    const stem = path.posix.basename(n.path, '.md')
    if (!byName.has(stem)) byName.set(stem, n.path)
    if (!byName.has(n.title.toLowerCase())) byName.set(n.title.toLowerCase(), n.path)
  }
  cached = { at: now, root: b, notes, byPath: new Set(notes.map((n) => n.path)), byName }
  return cached
}

export function state(): NotebookState {
  try { return { connected: true, notes: index().notes.length } } catch (e) {
    if (e instanceof NotebookError) return { connected: false, reason: e.message }
    throw e
  }
}

export function getFolder(rel: string): FolderView {
  const { abs, rel: r } = safe(rel, 'dir')
  const folders: FolderView['folders'] = []
  const notes: NoteMeta[] = []
  let idx: string | null = null
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    if (e.name.startsWith('.') || HIDDEN.has(e.name)) continue
    const p = r ? `${r}/${e.name}` : e.name
    if (e.isDirectory()) folders.push({ name: e.name, path: p })
    else if (e.isFile() && e.name.endsWith('.md')) {
      notes.push(meta(p, readFileSync(path.join(abs, e.name), 'utf8').slice(0, 4096)))
      if (e.name === `${path.posix.basename(r)}.md` || (r === '' && e.name === 'README.md')) idx = p
    }
  }
  folders.sort((a, b) => a.name.localeCompare(b.name))
  notes.sort((a, b) => a.path.localeCompare(b.path))
  return { path: r, folders, notes, index: idx }
}

export function getNote(rel: string): NoteView {
  const { abs, rel: r } = safe(rel, 'file')
  const { fm, body } = split(readFileSync(abs, 'utf8'))
  const ix = index()
  const resolver: LinkResolver = {
    wiki: (t) => ix.byName.get(t) ?? ix.byName.get(t.toLowerCase()) ?? '',
    has: (p) => ix.byPath.has(p),
  }
  const m = meta(r, readFileSync(abs, 'utf8').slice(0, 4096))
  const skip = new Set(['title', 'description'])
  // The page shows the title once: a body that opens with the same heading loses that heading.
  const lead = new RegExp('^\\s*#\\s+' + m.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\n')
  const text = body.replace(lead, '')
  const properties = Object.entries(fm).filter(([k]) => !skip.has(k)).map(([key, v]) => ({ key, value: str(v) })).filter((p) => p.value !== '')
  return { path: r, title: m.title, description: m.description, properties, html: renderNote(text, r, resolver), up: path.posix.dirname(r) === '.' ? '' : path.posix.dirname(r) }
}

export function search(q: string, limit = 40): NoteMeta[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8)
  if (!terms.length) return []
  const scored: { n: NoteMeta; s: number }[] = []
  for (const n of index().notes) {
    const t = n.title.toLowerCase(), d = n.description.toLowerCase(), g = n.tags.join(' ').toLowerCase(), p = n.path.toLowerCase()
    let s = 0
    for (const w of terms) {
      const hit = (t.includes(w) ? 10 : 0) + (g.includes(w) ? 4 : 0) + (d.includes(w) ? 3 : 0) + (p.includes(w) ? 1 : 0)
      if (!hit) { s = 0; break }
      s += hit
    }
    if (s) scored.push({ n, s })
  }
  return scored.sort((a, b) => b.s - a.s || a.n.path.localeCompare(b.n.path)).slice(0, limit).map((x) => x.n)
}

export const connected = (): boolean => !!root() && existsSync(root())
