// The authorization code flow with PKCE, against Keycloak or any OpenID provider (spec 0007).
import { IdClaims, Jwk, deriveKey, pkce, randomToken, seal, unseal, verifyIdToken } from './crypto'
import type { AuthConfig } from './config'
import { LOGIN_COOKIE, Session, safeNext } from './guard'

type Oidc = Extract<AuthConfig, { mode: 'oidc' }>
export const SESSION_SECONDS = 8 * 3600
export const LOGIN_SECONDS = 600

export interface Login { state: string; nonce: string; verifier: string; next: string; origin: string; exp: number }

export function startLogin(cfg: Oidc, origin: string, next: string, now = Date.now()): { url: string; cookie: string } {
  const { verifier, challenge } = pkce()
  const login: Login = { state: randomToken(), nonce: randomToken(), verifier, next: safeNext(next), origin, exp: Math.floor(now / 1000) + LOGIN_SECONDS }
  const q = new URLSearchParams({
    response_type: 'code', client_id: cfg.clientId, redirect_uri: `${origin}/auth/callback`, scope: 'openid',
    state: login.state, nonce: login.nonce, code_challenge: challenge, code_challenge_method: 'S256',
  })
  return { url: `${cfg.issuer}/protocol/openid-connect/auth?${q}`, cookie: seal(login, deriveKey(cfg.secret)) }
}

export type CallbackResult = { ok: true; session: string; next: string } | { ok: false; status: number; message: string }

export async function finishLogin(cfg: Oidc, query: URLSearchParams, loginCookie: string | undefined, fetchFn: typeof fetch = fetch, now = Date.now()): Promise<CallbackResult> {
  const key = deriveKey(cfg.secret)
  const login = unseal<Login>(loginCookie, key, now)
  if (!login) return { ok: false, status: 400, message: 'the sign-in took too long or did not start here; try again' }
  if (query.get('error')) return { ok: false, status: 403, message: `the sign-in was refused: ${query.get('error')}` }
  const code = query.get('code')
  if (!code || query.get('state') !== login.state) return { ok: false, status: 400, message: 'the sign-in answer does not match the request' }
  try {
    const tokenRes = await fetchFn(`${cfg.internal}/protocol/openid-connect/token`, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(10000),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: `${login.origin}/auth/callback`, client_id: cfg.clientId, client_secret: cfg.secret, code_verifier: login.verifier }),
    })
    if (!tokenRes.ok) return { ok: false, status: 502, message: `the identity provider refused the code (${tokenRes.status})` }
    const idToken = ((await tokenRes.json()) as { id_token?: string }).id_token
    if (!idToken) return { ok: false, status: 502, message: 'the identity provider sent no ID token' }
    const jwksRes = await fetchFn(`${cfg.internal}/protocol/openid-connect/certs`, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!jwksRes.ok) return { ok: false, status: 502, message: `the identity provider's keys are not available (${jwksRes.status})` }
    const claims: IdClaims = verifyIdToken(idToken, ((await jwksRes.json()) as { keys: Jwk[] }).keys, { issuer: cfg.issuer, audience: cfg.clientId, nonce: login.nonce, now })
    const groups = Array.isArray(claims.groups) ? claims.groups.filter((g) => typeof g === 'string') : []
    if (cfg.groups.length > 0 && !groups.some((g) => cfg.groups.includes(g))) return { ok: false, status: 403, message: 'this account is not in a group that may open the app' }
    const session: Session = { sub: claims.sub, name: claims.preferred_username || claims.sub, groups, exp: Math.floor(now / 1000) + SESSION_SECONDS }
    return { ok: true, session: seal(session, key), next: login.next }
  } catch (e) {
    return { ok: false, status: 502, message: `the sign-in could not be checked: ${(e as Error).message}` }
  }
}

export { LOGIN_COOKIE }
