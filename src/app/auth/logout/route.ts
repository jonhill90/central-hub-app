import { NextRequest, NextResponse } from 'next/server'
import { loadConfig } from '@/lib/auth/config'
import { SESSION_COOKIE, pickOrigin } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

// Ends this app's session, then the identity provider's own, and comes back to the home page (which asks to sign in again).
export function GET(req: NextRequest) {
  const cfg = loadConfig()
  if (cfg.mode !== 'oidc') return NextResponse.json({ error: cfg.mode === 'off' ? 'sign-in is off' : cfg.reason }, { status: cfg.mode === 'off' ? 404 : 503 })
  const origin = pickOrigin(cfg.origins, req.headers.get('x-forwarded-host') ?? req.headers.get('host'))
  const q = new URLSearchParams({ client_id: cfg.clientId, post_logout_redirect_uri: `${origin}/` })
  const res = NextResponse.redirect(`${cfg.issuer}/protocol/openid-connect/logout?${q}`)
  res.cookies.delete({ name: SESSION_COOKIE, path: '/' })
  return res
}
