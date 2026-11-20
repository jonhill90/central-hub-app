'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Nav } from '@/lib/nav'
import { filterLinks, flattenNav, groupOpen } from '@/lib/palette'

function Group({ id, label, href, open, children }: { id: string; label: string; href: string; open: boolean; children: { id: string; label: string; href: string }[] }) {
  const path = usePathname()
  const [isOpen, setOpen] = useState(open)
  useEffect(() => { setOpen(open) }, [open])
  return (
    <details open={isOpen} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)} data-group={id}>
      <summary>{label}</summary>
      <ul>
        <li><Link href={href} aria-current={path === href ? 'page' : undefined}>All of {label}</Link></li>
        {children.map((c) => (
          <li key={c.id}><Link href={c.href} aria-current={path === c.href ? 'page' : undefined}>{c.label}</Link></li>
        ))}
      </ul>
    </details>
  )
}

function Palette({ nav, onClose }: { nav: Nav; onClose: () => void }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const hits = filterLinks(flattenNav(nav), q)
  const go = (href: string) => { onClose(); router.push(href) }
  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Go to" onMouseDown={(e) => e.stopPropagation()}>
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={hits[i] ? `pal-${i}` : undefined}
          placeholder="Go to an area, room or page"
          value={q}
          onChange={(e) => { setQ(e.target.value); setI(0) }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setI(Math.min(i + 1, hits.length - 1)) }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setI(Math.max(i - 1, 0)) }
            else if (e.key === 'Enter' && hits[i]) go(hits[i].href)
          }}
        />
        <ul id="palette-list" role="listbox">
          {hits.map((l, n) => (
            <li key={l.href} id={`pal-${n}`} role="option" aria-selected={n === i} onMouseEnter={() => setI(n)} onClick={() => go(l.href)}>
              {l.label}{l.group ? <span className="muted"> · {l.group}</span> : null}
            </li>
          ))}
          {hits.length === 0 && <li className="muted">Nothing matches.</li>}
        </ul>
      </div>
    </div>
  )
}

export function Shell({ nav, children }: { nav: Nav; children: ReactNode }) {
  const path = usePathname()
  const [js, setJs] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [palette, setPalette] = useState(false)
  const menuBtn = useRef<HTMLButtonElement>(null)
  const open = groupOpen(nav, path)

  useEffect(() => { setJs(true) }, [])
  const beforePalette = useRef<HTMLElement | null>(null)
  const paletteOpen = useRef(false)
  const openPalette = useCallback(() => {
    beforePalette.current = document.activeElement as HTMLElement | null
    paletteOpen.current = true
    setPalette(true)
  }, [])
  const closePalette = useCallback(() => {
    if (!paletteOpen.current) return
    paletteOpen.current = false
    setPalette(false)
    setTimeout(() => beforePalette.current?.focus(), 0)
  }, [])
  useEffect(() => { setDrawer(false) }, [path])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette() }
      else if (e.key === 'Escape') { closePalette(); setDrawer(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const closeDrawer = useCallback(() => setDrawer(false), [])

  // Focus goes into the drawer when it opens and back to the Menu button when it closes, however it closes.
  const wasOpen = useRef(false)
  useEffect(() => {
    if (drawer) {
      document.querySelector<HTMLElement>('#side .find')?.focus()
    } else if (wasOpen.current) {
      menuBtn.current?.focus()
    }
    wasOpen.current = drawer
  }, [drawer])

  return (
    <div className={`shell${js ? ' js' : ''}${drawer ? ' drawer' : ''}`}>
      <header className="topbar">
        <button ref={menuBtn} type="button" aria-expanded={drawer} aria-controls="side" onClick={() => setDrawer(!drawer)}>Menu</button>
        <span className="brand">Central Hub</span>
        <button type="button" onClick={openPalette}>Search</button>
      </header>
      {drawer && <div className="scrim" onClick={closeDrawer} />}
      <nav id="side" className="side" aria-label="Main">
        <div className="brand">Central Hub</div>
        <button type="button" className="find" onClick={openPalette}>Go to… <kbd>Ctrl K</kbd></button>
        <ul>
          {nav.top.map((l) => (
            <li key={l.id}><Link href={l.href} aria-current={path === l.href ? 'page' : undefined}>{l.label}</Link></li>
          ))}
        </ul>
        {nav.areas.map((g) => (
          <Group key={g.id} id={g.id} label={g.label} href={g.href} open={open === g.id}>{g.children}</Group>
        ))}
      </nav>
      <main>{children}</main>
      {palette && <Palette nav={nav} onClose={closePalette} />}
    </div>
  )
}
