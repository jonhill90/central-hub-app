// What to do with a request, as a pure function so every branch is tested (spec 0007 requirements 2 to 4).
import { unseal } from './crypto'

export interface Session { sub: string; name: string; groups: string[]; exp: number }
export type Decision =
  | { action: 'allow' }
  | { action: 'login'; next: string }
  | { action: 'deny'; status: 401 | 503; message: string }

export const SESSION_COOKIE = 'hub_session'
export const LOGIN_COOKIE = 'hub_login'

/** Reachable without a session: the sign-in routes, the probe path and Next's own static files. */
export function isPublic(pathname: string): boolean {
  return pathname === '/api/v1/health' || pathname === '/auth' || pathname.startsWith('/auth/') || pathname.startsWith('/_next/') || pathname === '/favicon.ico'
}

/** A return address stays on this site: one slash, then anything but another slash or a backslash. */
export function safeNext(v: string | null | undefined): string {
  return v && /^\/(?![/\\])/.test(v) && !/[\r\n]/.test(v) ? v : '/'
}

export function decide(cfg: { mode: string; reason?: string }, key: Buffer | null, pathname: string, search: string, cookie: string | undefined, now = Date.now()): Decision {
  if (cfg.mode === 'off') return { action: 'allow' }
  if (cfg.mode !== 'oidc' || !key) return { action: 'deny', status: 503, message: cfg.reason || 'sign-in is not configured' }
  if (isPublic(pathname)) return { action: 'allow' }
  if (unseal<Session>(cookie, key, now)) return { action: 'allow' }
  if (pathname.startsWith('/api/')) return { action: 'deny', status: 401, message: 'sign in first' }
  return { action: 'login', next: safeNext(pathname + search) }
}

/** The origin to build addresses from: the request's own host if it is one we serve, else the first. */
export function pickOrigin(origins: string[], host: string | null | undefined): string {
  const h = (host || '').split(',')[0].trim().toLowerCase()
  return origins.find((o) => o.toLowerCase() === `https://${h}`) ?? origins[0]
}
