import { NextRequest, NextResponse } from 'next/server'
import { loadConfig } from '@/lib/auth/config'
import { LOGIN_COOKIE, SESSION_COOKIE, pickOrigin } from '@/lib/auth/guard'
import { SESSION_SECONDS, finishLogin } from '@/lib/auth/flow'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const cfg = loadConfig()
  if (cfg.mode !== 'oidc') return NextResponse.json({ error: cfg.mode === 'off' ? 'sign-in is off' : cfg.reason }, { status: cfg.mode === 'off' ? 404 : 503 })
  const r = await finishLogin(cfg, req.nextUrl.searchParams, req.cookies.get(LOGIN_COOKIE)?.value)
  if (!r.ok) {
    const res = NextResponse.json({ error: r.message }, { status: r.status })
    res.cookies.delete({ name: LOGIN_COOKIE, path: '/auth' })
    return res
  }
  // The sign-in ends on the host it began on: the callback arrived there, and the cookies belong to that host.
  const origin = pickOrigin(cfg.origins, req.headers.get('x-forwarded-host') ?? req.headers.get('host'))
  const res = NextResponse.redirect(`${origin}${r.next}`)
  res.cookies.set(SESSION_COOKIE, r.session, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS })
  res.cookies.delete({ name: LOGIN_COOKIE, path: '/auth' })
  return res
}
