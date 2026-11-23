// Turns one notebook note (markdown) into safe HTML for the app. Pure: no files, no network.
// Spec 0010. Rules: raw HTML in a note is shown as text, never run; a link is kept only when it is
// http(s), mailto, or points at another note (rewritten to /notebook/<path>); anything else loses its link;
// an image is shown as its alt text (the app does not serve notebook files other than notes).
import { Marked, Renderer, type Tokens } from 'marked'
import path from 'node:path'

export const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export interface LinkResolver {
  /** A note path (relative to the notebook root) for a wikilink target, or '' when no note has that name. */
  wiki(target: string): string
  /** True when the path is a note (a .md file) the notebook holds. */
  has(notePath: string): boolean
}

/** The in-app address of a note. Each segment is encoded; `/notebook/` plus the path without a leading slash. */
export const noteHref = (notePath: string): string => '/notebook/' + notePath.split('/').map(encodeURIComponent).join('/')

/** Rewrite one link target found in the note at `from`. Returns '' when the link must not be a link. */
export function rewriteHref(href: string, from: string, r: LinkResolver): string {
  const h = href.trim()
  if (/^(https?:\/\/|mailto:)/i.test(h)) return h
  if (/^wiki:/.test(h)) { let t = ''; try { t = decodeURIComponent(h.slice(5)) } catch { return '' } const p = r.wiki(t); return p ? noteHref(p) : '' }
  if (/^[a-z][a-z0-9+.-]*:/i.test(h) || h.startsWith('//')) return ''   // javascript:, data:, file:, protocol-relative
  if (h.startsWith('#')) return h
  const [target, frag] = h.split('#')
  if (!target) return ''
  let dec = target
  try { dec = decodeURIComponent(target) } catch { return '' }
  const joined = path.posix.normalize(path.posix.join(path.posix.dirname(from), dec))
  if (joined.startsWith('..') || joined.startsWith('/')) return ''
  if (r.has(joined)) return noteHref(joined) + (frag ? '#' + frag : '')
  // A link to a folder, or to a note that is not there: the folder page shows what exists.
  return ''
}

/** `[[target]]` and `[[target|text]]` outside code fences and spans become `[text](wiki:target)`. */
export function wikilinks(md: string): string {
  const parts = md.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g)
  return parts.map((p, i) => (i % 2 === 1 ? p : p.replace(/\[\[([^\]\|\n]+)(?:\|([^\]\n]+))?\]\]/g, (_m, t: string, a?: string) => `[${(a ?? t).trim()}](wiki:${encodeURIComponent(t.trim())})`))).join('')
}

export function renderNote(md: string, from: string, r: LinkResolver): string {
  const renderer = new Renderer()
  renderer.html = ({ text }) => escapeHtml(text)
  renderer.image = ({ text }) => escapeHtml(text || 'image')
  renderer.link = function (this: Renderer, { href, tokens }: Tokens.Link) {
    const inner = this.parser.parseInline(tokens)
    const to = rewriteHref(href, from, r)
    if (!to) return inner
    const ext = /^(https?:|mailto:)/i.test(to)
    return `<a href="${escapeHtml(to)}"${ext ? ' rel="noopener noreferrer" target="_blank"' : ''}>${inner}</a>`
  }
  renderer.code = ({ text, lang }) => `<pre><code${lang ? ` class="language-${escapeHtml(lang.split(/\s/)[0]).replace(/[^a-z0-9_-]/gi, '')}"` : ''}>${escapeHtml(text)}\n</code></pre>`
  const marked = new Marked({ gfm: true, breaks: false, renderer })
  return marked.parse(wikilinks(md), { async: false }) as string
}
