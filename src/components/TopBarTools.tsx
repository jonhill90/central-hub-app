'use client'
import { useEffect, useRef, useState } from 'react'
import { Bell, Moon, Sun, User } from 'lucide-react'

type Theme = 'dark' | 'light'

/** The theme the browser is showing: the saved choice, else the system setting. */
function current(): Theme {
  const set = document.documentElement.dataset.theme
  if (set === 'light' || set === 'dark') return set
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')
  useEffect(() => {
    let saved: string | null = null
    try { saved = localStorage.getItem('theme') } catch { /* private window */ }
    if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved
    setTheme(current())
  }, [])
  const flip = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch { /* private window */ }
    setTheme(next)
  }
  return (
    <button type="button" className="tool" onClick={flip} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  )
}

/** The bell. Nothing reports to the hub yet, so it says so rather than showing made-up items. */
export function Bell_() {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [open])
  return (
    <div className="pop-wrap" ref={box}>
      <button type="button" className="tool" aria-label="Notifications" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Bell size={20} aria-hidden="true" />
      </button>
      {open && (
        <div className="pop" role="region" aria-label="Notifications">
          <h3>Notifications</h3>
          <p className="muted">Nothing is waiting. Rooms do not report here yet.</p>
        </div>
      )}
    </div>
  )
}

/** The avatar. Sign-in is off, so it is a plain person mark with no name. */
export function Avatar() {
  return <span className="avatar" role="img" aria-label="Not signed in"><User size={18} aria-hidden="true" /></span>
}
