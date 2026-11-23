import { beforeEach, describe, expect, it } from 'vitest'
import path from 'node:path'
import { getFolder, getNote, NotebookError, resetIndex, search, state } from '@/lib/notebook'
import { renderNote, rewriteHref, wikilinks } from '@/lib/notebook-render'

const fixture = path.resolve('tests/fixtures/notebook')
beforeEach(() => { process.env.HUB_NOTEBOOK_DIR = fixture; process.env.HUB_ALLOW_OPEN_DATA = 'yes'; delete process.env.HUB_AUTH; resetIndex() })

describe('notebook reader (spec 0010)', () => {
  it('says plainly when no notebook is connected', () => {
    delete process.env.HUB_NOTEBOOK_DIR; resetIndex()
    expect(state()).toEqual({ connected: false, reason: expect.stringContaining('not connected') })
    expect(() => getFolder('')).toThrow(NotebookError)
  })
  it('stays closed while sign-in is off, and opens when sign-in is on', () => {
    delete process.env.HUB_ALLOW_OPEN_DATA; resetIndex()
    expect(state()).toEqual({ connected: false, reason: expect.stringContaining('sign-in is off') })
    expect(() => getNote('README.md')).toThrow(expect.objectContaining({ status: 503 }))
    process.env.HUB_AUTH = 'oidc'; resetIndex()
    expect(state()).toEqual({ connected: true, notes: 4 })
  })
  it('counts and lists the notes', () => {
    expect(state()).toEqual({ connected: true, notes: 4 })
    const top = getFolder('')
    expect(top.folders.map((f) => f.name)).toEqual(['01-notes', '99-meta'])
    expect(top.index).toBe('README.md')
  })
  it('titles come from front matter, then the first heading, then the file name', () => {
    expect(getNote('01-notes/01a-atomic/2026112300010001.md').title).toBe('One idea about tailnets')
    expect(getNote('99-meta/rules.md').title).toBe('Rules without front matter')
  })
  it('shows front matter as properties and the body as HTML with a table', () => {
    const n = getNote('01-notes/01a-atomic/2026112300010001.md')
    expect(n.properties.find((p) => p.key === 'tags')?.value).toBe('note, 11-2026, tailnet')
    expect(n.html).toContain('<table>')
    expect(n.up).toBe('01-notes/01a-atomic')
  })
  it('a link to another note stays in the app; a wikilink resolves by id or title; an unknown one is plain text', () => {
    const n = getNote('01-notes/01a-atomic/2026112300010001.md')
    expect(n.html).toContain('href="/notebook/README.md"')
    expect(n.html).toContain('href="/notebook/01-notes/01a-atomic/2026112300020001.md"')
    expect(n.html).not.toContain('wiki:')
    expect(n.html).toContain('nope')
  })
  it('raw HTML and javascript: links never run, and code keeps what it says', () => {
    const n = getNote('01-notes/01a-atomic/2026112300010001.md')
    expect(n.html).not.toMatch(/<script/i)
    expect(n.html).toContain('&lt;script&gt;alert(2)&lt;/script&gt;')
    expect(n.html).not.toContain('javascript:')
    expect(n.html).toContain('href="https://example.org/x"')
    expect(n.html).not.toContain('<img')
  })
  it('refuses a path that climbs out, a dot folder, a non-note and a missing note', () => {
    for (const p of ['../etc/passwd', '01-notes/../../x.md', '.git/config', 'README.txt']) expect(() => getNote(p)).toThrow(NotebookError)
    expect(() => getFolder('..')).toThrow(NotebookError)
    expect(() => getNote('nope.md')).toThrow(expect.objectContaining({ status: 404 }))
  })
  it('search ranks a title hit above a description hit and needs every word', () => {
    expect(search('tailnet').map((n) => n.path)[0]).toBe('01-notes/01a-atomic/2026112300010001.md')
    expect(search('firewall').map((n) => n.title)).toEqual(['Another idea'])
    expect(search('tailnet firewall')).toEqual([])
    expect(search('   ')).toEqual([])
  })
})

describe('link rewriting', () => {
  const r = { wiki: () => '', has: (p: string) => p === 'a/b.md' }
  it('keeps https and mailto, drops other schemes, resolves relative notes, keeps the fragment', () => {
    expect(rewriteHref('https://x.y/z', 'a/c.md', r)).toBe('https://x.y/z')
    expect(rewriteHref('data:text/html,hi', 'a/c.md', r)).toBe('')
    expect(rewriteHref('//evil.example/x', 'a/c.md', r)).toBe('')
    expect(rewriteHref('b.md#top', 'a/c.md', r)).toBe('/notebook/a/b.md#top')
    expect(rewriteHref('../../x.md', 'a/c.md', r)).toBe('')
  })
  it('wikilinks are rewritten outside code only', () => {
    expect(wikilinks('see [[x|y]] and `[[z]]`')).toBe('see [y](wiki:x) and `[[z]]`')
    expect(renderNote('hi', 'a.md', r)).toContain('<p>hi</p>')
  })
})
