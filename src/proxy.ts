import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { loadConfig } from '@/lib/auth/config'
import { deriveKey } from '@/lib/auth/crypto'
import { SESSION_COOKIE, decide, pickOrigin } from '@/lib/auth/guard'

// Runs before every page and API route (Next 16 proxy, Node runtime). With HUB_AUTH off it lets everything
// through; with oidc it needs a valid session or sends the visitor to sign in. Spec 0007.
export function proxy(req: NextRequest) {
  const cfg = loadConfig()
  const key = cfg.mode === 'oidc' ? deriveKey(cfg.secret, 'session') : null
  const d = decide(cfg, key, req.nextUrl.pathname, req.nextUrl.search, req.cookies.get(SESSION_COOKIE)?.value)
  if (d.action === 'allow') return NextResponse.next()
  if (d.action === 'deny') return NextResponse.json({ error: d.message }, { status: d.status })
  const origin = cfg.mode === 'oidc' ? pickOrigin(cfg.origins, req.headers.get('x-forwarded-host') ?? req.headers.get('host')) : ''
  return NextResponse.redirect(`${origin}/auth/login?next=${encodeURIComponent(d.next)}`)
}

export const config = { matcher: ['/((?!_next/static|_next/image).*)'] }
