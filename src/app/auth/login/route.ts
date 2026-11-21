import { NextRequest, NextResponse } from 'next/server'
import { loadConfig } from '@/lib/auth/config'
import { LOGIN_COOKIE, pickOrigin, safeNext } from '@/lib/auth/guard'
import { LOGIN_SECONDS, startLogin } from '@/lib/auth/flow'

export const dynamic = 'force-dynamic'

export function GET(req: NextRequest) {
  const cfg = loadConfig()
  if (cfg.mode !== 'oidc') return NextResponse.json({ error: cfg.mode === 'off' ? 'sign-in is off' : cfg.reason }, { status: cfg.mode === 'off' ? 404 : 503 })
  const origin = pickOrigin(cfg.origins, req.headers.get('x-forwarded-host') ?? req.headers.get('host'))
  const { url, cookie } = startLogin(cfg, origin, safeNext(req.nextUrl.searchParams.get('next')))
  const res = NextResponse.redirect(url)
  res.cookies.set(LOGIN_COOKIE, cookie, { httpOnly: true, secure: true, sameSite: 'lax', path: '/auth', maxAge: LOGIN_SECONDS })
  return res
}
