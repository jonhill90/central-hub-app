// Sign-in building blocks on node:crypto only (spec 0007). No library: every check is here and tested.
import { createHash, createHmac, createPublicKey, hkdfSync, randomBytes, timingSafeEqual, verify as rsaVerify } from 'node:crypto'

export const b64u = (b: Buffer | string): string => Buffer.from(b).toString('base64url')

/** One signing key per client secret; the secret itself is never used as a key directly. */
export function deriveKey(secret: string): Buffer {
  return Buffer.from(hkdfSync('sha256', secret, 'central-hub-app', 'session-cookie-v1', 32))
}

/** `<payload>.<mac>`; the payload is JSON, so a cookie carries no secret and is only tamper-proof. */
export function seal(payload: object, key: Buffer): string {
  const body = b64u(JSON.stringify(payload))
  return `${body}.${b64u(createHmac('sha256', key).update(body).digest())}`
}

/** The payload if the mac holds and `exp` (seconds) is in the future, else null. */
export function unseal<T extends { exp: number }>(value: string | undefined, key: Buffer, now = Date.now()): T | null {
  if (!value) return null
  const parts = value.split('.')
  if (parts.length !== 2) return null
  const want = createHmac('sha256', key).update(parts[0]).digest()
  let got: Buffer
  try { got = Buffer.from(parts[1], 'base64url') } catch { return null }
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null
  try {
    const p = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as T
    return typeof p.exp === 'number' && p.exp * 1000 > now ? p : null
  } catch { return null }
}

export function pkce(): { verifier: string; challenge: string } {
  const verifier = b64u(randomBytes(32))
  return { verifier, challenge: b64u(createHash('sha256').update(verifier).digest()) }
}
export const randomToken = (): string => b64u(randomBytes(24))

export interface Jwk { kty: string; kid?: string; n?: string; e?: string; alg?: string; use?: string }
export interface IdClaims { iss: string; aud: string | string[]; sub: string; exp: number; nonce?: string; preferred_username?: string; groups?: string[] }
export interface Expect { issuer: string; audience: string; nonce: string; now?: number }

/** Verify an RS256 ID token against the realm's keys: signature, issuer, audience, expiry, nonce. Throws a plain reason. */
export function verifyIdToken(token: string, keys: Jwk[], want: Expect): IdClaims {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('not a JWT')
  let header: { alg?: string; kid?: string }, claims: IdClaims
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'))
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
  } catch { throw new Error('not a JWT') }
  if (header.alg !== 'RS256') throw new Error('algorithm is not RS256')
  const jwk = keys.find((k) => k.kty === 'RSA' && k.kid === header.kid && (k.use === undefined || k.use === 'sig'))
  if (!jwk) throw new Error('no key for this token')
  const ok = rsaVerify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key: jwk as never, format: 'jwk' }), Buffer.from(parts[2], 'base64url'))
  if (!ok) throw new Error('bad signature')
  if (claims.iss !== want.issuer) throw new Error('wrong issuer')
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
  if (!aud.includes(want.audience)) throw new Error('wrong audience')
  if (typeof claims.exp !== 'number' || claims.exp * 1000 <= (want.now ?? Date.now())) throw new Error('expired')
  if (claims.nonce !== want.nonce) throw new Error('wrong nonce')
  if (typeof claims.sub !== 'string' || !claims.sub) throw new Error('no subject')
  return claims
}
