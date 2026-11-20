import type { ReactNode } from 'react'
import '@/styles/app.css'
import { getCatalog } from '@/lib/catalog'
import { buildNav } from '@/lib/nav'
import { Sidebar } from '@/components/Sidebar'

export const metadata = { title: 'Central Hub', description: 'A map of the Central Hub lab, built from catalog files' }

export default function RootLayout({ children }: { children: ReactNode }) {
  const nav = buildNav(getCatalog())
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <Sidebar nav={nav} />
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
