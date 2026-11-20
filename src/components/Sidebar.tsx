import Link from 'next/link'
import type { Nav } from '@/lib/nav'

export function Sidebar({ nav }: { nav: Nav }) {
  return (
    <nav className="side" aria-label="Main">
      <div className="brand">Central Hub</div>
      <ul>
        {nav.top.map((l) => (
          <li key={l.id}><Link href={l.href}>{l.label}</Link></li>
        ))}
      </ul>
      {nav.areas.map((g) => (
        <section key={g.id}>
          <h2><Link href={g.href}>{g.label}</Link></h2>
          <ul>
            {g.children.map((c) => (
              <li key={c.id}><Link href={c.href}>{c.label}</Link></li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  )
}
