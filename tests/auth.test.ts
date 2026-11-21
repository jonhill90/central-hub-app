import { describe, expect, it } from 'vitest'
import { generateKeyPairSync, createSign } from 'node:crypto'
import { b64u, deriveKey, pkce, seal, unseal, verifyIdToken } from '@/lib/auth/crypto'
import { loadConfig } from '@/lib/auth/config'
import { decide, isPublic, pickOrigin, safeNext } from '@/lib/auth/guard'
import { finishLogin, startLogin } from '@/lib/auth/flow'

// Spec 0007: every requirement's test.
const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', use: 'sig', alg: 'RS256' } as never
const ISS = 'https://sso.example.com/realms/lab'
const NOW = 1_800_000_000_000
const jwt = (claims: object, header: object = { alg: 'RS256', kid: 'k1' }, sign = true) => {
  const h = b64u(JSON.stringify(header)), p = b64u(JSON.stringify(claims))
  const sig = sign ? createSign('RSA-SHA256').update(`${h}.${p}`).sign(privateKey) : Buffer.from('x')
  return `${h}.${p}.${b64u(sig)}`
}
const good = { iss: ISS, aud: 'central-hub-app', sub: 'u1', exp: NOW / 1000 + 60, nonce: 'n1', preferred_username: 'owner', groups: ['lab-admins'] }
const want = { issuer: ISS, audience: 'central-hub-app', nonce: 'n1', now: NOW }

describe('ID token check (req 1)', () => {
  it('accepts a good token', () => expect(verifyIdToken(jwt(good), [jwk], want).sub).toBe('u1'))
  it.each([
    ['wrong issuer', { ...good, iss: 'https://evil.example.com/realms/lab' }],
    ['wrong audience', { ...good, aud: 'grafana' }],
    ['expired', { ...good, exp: NOW / 1000 - 1 }],
    ['wrong nonce', { ...good, nonce: 'other' }],
    ['no subject', { ...good, sub: '' }],
  ])('rejects %s', (_n, claims) => expect(() => verifyIdToken(jwt(claims), [jwk], want)).toThrow())
  it('rejects a bad signature, an unknown key, alg none and alg HS256', () => {
    expect(() => verifyIdToken(jwt(good, undefined, false), [jwk], want)).toThrow(/signature/)
    expect(() => verifyIdToken(jwt(good, { alg: 'RS256', kid: 'zzz' }), [jwk], want)).toThrow(/no key/)
    expect(() => verifyIdToken(jwt(good, { alg: 'none' }), [jwk], want)).toThrow(/RS256/)
    expect(() => verifyIdToken(jwt(good, { alg: 'HS256', kid: 'k1' }), [jwk], want)).toThrow(/RS256/)
    expect(() => verifyIdToken('a.b', [jwk], want)).toThrow()
  })
  it('accepts an audience list that holds the client', () => expect(verifyIdToken(jwt({ ...good, aud: ['x', 'central-hub-app'] }), [jwk], want).sub).toBe('u1'))
})

describe('session cookie (req 2)', () => {
  const key = deriveKey('s3cret')
  it('round-trips, and fails after tampering, expiry or with another key', () => {
    const c = seal({ sub: 'u1', exp: NOW / 1000 + 10 }, key)
    expect(unseal<{ sub: string; exp: number }>(c, key, NOW)?.sub).toBe('u1')
    expect(unseal(c.replace(/^./, (x) => (x === 'a' ? 'b' : 'a')), key, NOW)).toBeNull()
    expect(unseal(c, key, NOW + 20_000)).toBeNull()
    expect(unseal(c, deriveKey('other'), NOW)).toBeNull()
    expect(unseal(undefined, key, NOW)).toBeNull()
    expect(unseal('junk', key, NOW)).toBeNull()
  })
  it('a PKCE challenge is the S256 of its verifier', () => {
    const { verifier, challenge } = pkce()
    expect(challenge).toBe(b64u(require('node:crypto').createHash('sha256').update(verifier).digest()))
  })
})

describe('configuration fails closed (req 3)', () => {
  const files: Record<string, string> = { '/d/issuer': ISS, '/d/client-secret': 's3cret', '/d/public-urls': 'https://a.example.com\nhttps://b.example.com' }
  const rd = (f: string) => files[f] ?? ''
  it('is off by default', () => expect(loadConfig({}, rd).mode).toBe('off'))
  it('reads the mounted files', () => {
    const c = loadConfig({ HUB_AUTH: 'oidc', HUB_OIDC_DIR: '/d' }, rd)
    expect(c).toMatchObject({ mode: 'oidc', issuer: ISS, secret: 's3cret', clientId: 'central-hub-app', internal: ISS, origins: ['https://a.example.com', 'https://b.example.com'] })
  })
  it('is broken, not open, when a file is missing, the mode is unknown or an address is not https', () => {
    expect(loadConfig({ HUB_AUTH: 'oidc', HUB_OIDC_DIR: '/none' }, rd)).toMatchObject({ mode: 'broken' })
    expect(loadConfig({ HUB_AUTH: 'yes' }, rd)).toMatchObject({ mode: 'broken' })
    expect(loadConfig({ HUB_AUTH: 'oidc', HUB_OIDC_DIR: '/d', HUB_PUBLIC_URLS: 'http://a.example.com' }, rd)).toMatchObject({ mode: 'broken' })
  })
})

describe('the guard (req 4)', () => {
  const key = deriveKey('s3cret')
  const ok = { mode: 'oidc' }
  const cookie = seal({ sub: 'u', name: 'u', groups: [], exp: NOW / 1000 + 10 }, key)
  it('off lets everything through', () => expect(decide({ mode: 'off' }, null, '/areas/x', '', undefined, NOW)).toEqual({ action: 'allow' }))
  it('broken answers 503 for everything, even public paths', () => {
    expect(decide({ mode: 'broken', reason: 'r' }, null, '/', '', undefined, NOW)).toEqual({ action: 'deny', status: 503, message: 'r' })
    expect(decide({ mode: 'broken' }, null, '/api/v1/health', '', undefined, NOW)).toMatchObject({ status: 503 })
  })
  it('a page without a session goes to sign-in, an API call gets 401, a session passes', () => {
    expect(decide(ok, key, '/areas/x', '?q=1', undefined, NOW)).toEqual({ action: 'login', next: '/areas/x?q=1' })
    expect(decide(ok, key, '/api/v1/catalog', '', undefined, NOW)).toMatchObject({ action: 'deny', status: 401 })
    expect(decide(ok, key, '/api/v1/catalog', '', 'forged.value', NOW)).toMatchObject({ status: 401 })
    expect(decide(ok, key, '/api/v1/catalog', '', cookie, NOW)).toEqual({ action: 'allow' })
  })
  it('only the sign-in routes, the probe and static files are public', () => {
    for (const p of ['/auth/login', '/auth/callback', '/api/v1/health', '/_next/static/x.js']) expect(isPublic(p), p).toBe(true)
    for (const p of ['/', '/api/v1/catalog', '/api/v1/agents', '/authx', '/agents/x', '/api/v1/health/x']) expect(isPublic(p), p).toBe(false)
  })
  it('a return address stays on this site; a host is used only if listed', () => {
    expect(safeNext('/areas/x?y=1')).toBe('/areas/x?y=1')
    for (const v of ['//evil.example.com', '/\\evil.example.com', 'https://evil.example.com', '', null, undefined, '/a\nb']) expect(safeNext(v as never)).toBe('/')
    const o = ['https://a.example.com', 'https://b.example.com']
    expect(pickOrigin(o, 'b.example.com')).toBe('https://b.example.com')
    expect(pickOrigin(o, 'evil.example.com')).toBe('https://a.example.com')
    expect(pickOrigin(o, null)).toBe('https://a.example.com')
  })
})

describe('the code flow (req 5)', () => {
  const cfg = { mode: 'oidc' as const, issuer: ISS, internal: 'http://sso.internal:8080/realms/lab', clientId: 'central-hub-app', secret: 's3cret', origins: ['https://a.example.com'], groups: ['lab-admins', 'lab-viewers'] }
  const key = deriveKey(cfg.secret)
  it('the login address carries PKCE S256, state, nonce and the exact redirect', () => {
    const { url } = startLogin(cfg, 'https://a.example.com', '/agents', NOW)
    const u = new URL(url), q = u.searchParams
    expect(u.origin + u.pathname).toBe(`${ISS}/protocol/openid-connect/auth`)
    expect(q.get('code_challenge_method')).toBe('S256')
    expect(q.get('redirect_uri')).toBe('https://a.example.com/auth/callback')
    expect(q.get('response_type')).toBe('code')
    expect(q.get('state')).toBeTruthy(); expect(q.get('nonce')).toBeTruthy()
  })
  const fakeFetch = (claims: object, tokenStatus = 200): typeof fetch => (async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url)
    expect(u.startsWith(cfg.internal)).toBe(true)
    if (u.endsWith('/token')) {
      const body = init!.body as URLSearchParams
      expect(body.get('client_secret')).toBe('s3cret'); expect(body.get('code_verifier')).toBeTruthy(); expect(body.get('code')).toBe('c1')
      return new Response(JSON.stringify({ id_token: jwt(claims) }), { status: tokenStatus })
    }
    return new Response(JSON.stringify({ keys: [jwk] }))
  }) as never
  function begin() {
    const { url, cookie } = startLogin(cfg, 'https://a.example.com', '/agents', NOW)
    const q = new URL(url).searchParams
    return { cookie, state: q.get('state')!, nonce: q.get('nonce')! }
  }
  it('signs in with a matching state and nonce, and the session lasts hours, not forever', async () => {
    const { cookie, state, nonce } = begin()
    const r = await finishLogin(cfg, new URLSearchParams({ code: 'c1', state }), cookie, fakeFetch({ ...good, nonce }), NOW)
    expect(r).toMatchObject({ ok: true, next: '/agents' })
    if (r.ok) { const s = unseal<{ name: string; exp: number }>(r.session, key, NOW); expect(s?.name).toBe('owner'); expect(s!.exp * 1000 - NOW).toBe(8 * 3600 * 1000) }
  })
  it('refuses a wrong state, a missing or expired login cookie, a refused code, a wrong nonce, and a group not allowed', async () => {
    const { cookie, state, nonce } = begin()
    const f = fakeFetch({ ...good, nonce })
    expect(await finishLogin(cfg, new URLSearchParams({ code: 'c1', state: 'x' }), cookie, f, NOW)).toMatchObject({ ok: false, status: 400 })
    expect(await finishLogin(cfg, new URLSearchParams({ code: 'c1', state }), undefined, f, NOW)).toMatchObject({ ok: false, status: 400 })
    expect(await finishLogin(cfg, new URLSearchParams({ code: 'c1', state }), cookie, f, NOW + 700_000)).toMatchObject({ ok: false, status: 400 })
    expect(await finishLogin(cfg, new URLSearchParams({ error: 'access_denied', state }), cookie, f, NOW)).toMatchObject({ ok: false, status: 403 })
    expect(await finishLogin(cfg, new URLSearchParams({ code: 'c1', state }), cookie, fakeFetch({ ...good, nonce }, 400), NOW)).toMatchObject({ ok: false, status: 502 })
    expect(await finishLogin(cfg, new URLSearchParams({ code: 'c1', state }), cookie, fakeFetch({ ...good, nonce: 'bad' }), NOW)).toMatchObject({ ok: false, status: 502 })
    expect(await finishLogin(cfg, new URLSearchParams({ code: 'c1', state }), cookie, fakeFetch({ ...good, nonce, groups: ['other'] }), NOW)).toMatchObject({ ok: false, status: 403 })
  })
})
