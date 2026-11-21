'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Bot, ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight, Home, Menu, Search } from 'lucide-react'
import type { Nav } from '@/lib/nav'
import { areaIcon } from './icons'
import { HillLogo } from './HillLogo'
import { filterLinks, flattenNav, groupOpen } from '@/lib/palette'

function Group({ id, label, href, open, collapsed, expand, children }: { id: string; label: string; href: string; open: boolean; collapsed: boolean; expand: () => void; children: { id: string; label: string; href: string }[] }) {
  const path = usePathname()
  const Icon = areaIcon(id)
  const [isOpen, setOpen] = useState(open)
  useEffect(() => { setOpen(open) }, [open])
  return (
    <details open={isOpen} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)} data-group={id}>
      <summary title={collapsed ? label : undefined} onClick={(e) => { if (collapsed) { e.preventDefault(); expand(); setOpen(true) } }}>
        <Icon size={20} aria-hidden="true" />
        <span className="lbl">{label}</span>
        <ChevronRight size={16} aria-hidden="true" className="chev closed" />
        <ChevronDown size={16} aria-hidden="true" className="chev opened" />
      </summary>
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
      document.querySelector<HTMLElement>('#side a')?.focus()
    } else if (wasOpen.current) {
      menuBtn.current?.focus()
    }
    wasOpen.current = drawer
  }, [drawer])

  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => { try { setCollapsed(localStorage.getItem('sidebar-collapsed') === 'true') } catch { /* private window */ } }, [])
  const setCollapse = useCallback((v: boolean) => {
    setCollapsed(v)
    try { localStorage.setItem('sidebar-collapsed', String(v)) } catch { /* private window */ }
  }, [])

  return (
    <div className={`shell${js ? ' js' : ''}${drawer ? ' drawer' : ''}${collapsed ? ' collapsed' : ''}`}>
      <header className="topbar">
        <button ref={menuBtn} type="button" className="menu-btn" aria-label="Open menu" aria-expanded={drawer} aria-controls="side" onClick={() => setDrawer(!drawer)}><Menu size={22} aria-hidden="true" /></button>
        <Link href="/" className="logo-link" aria-label="Central Hub home"><HillLogo /></Link>
        <button type="button" className="search" onClick={openPalette}>
          <Search size={16} aria-hidden="true" />
          <span className="lbl">Go to an area, room or page</span>
          <kbd>Ctrl K</kbd>
        </button>
      </header>
      {drawer && <div className="scrim" onClick={closeDrawer} />}
      <nav id="side" className="side" aria-label="Main">
        <ul className="top">
          {nav.top.map((l) => {
            const Icon = l.id === 'agents' ? Bot : Home
            return (
              <li key={l.id}>
                <Link href={l.href} title={collapsed ? l.label : undefined} aria-current={path === l.href || (l.href !== '/' && path.startsWith(l.href + '/')) ? 'page' : undefined}>
                  <Icon size={20} aria-hidden="true" /><span className="lbl">{l.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
        {nav.areas.map((g) => (
          <Group key={g.id} id={g.id} label={g.label} href={g.href} open={open === g.id} collapsed={collapsed} expand={() => setCollapse(false)}>{g.children}</Group>
        ))}
        <button type="button" className="collapse" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapse(!collapsed)}>
          {collapsed ? <ChevronsRight size={18} aria-hidden="true" /> : <ChevronsLeft size={18} aria-hidden="true" />}
        </button>
      </nav>
      <main>{children}</main>
      {palette && <Palette nav={nav} onClose={closePalette} />}
    </div>
  )
}
