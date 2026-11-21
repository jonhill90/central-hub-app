// The sign-in settings, read from the environment and, for the three values that name this lab, from files the
// platform mounts (a Secret holds the client secret, a ConfigMap-like Secret holds the public names). Nothing
// about the lab is in this repository. Spec 0007 rule 2: with HUB_AUTH=oidc, anything missing means the app
// refuses every request; it never falls back to open.
import { readFileSync } from 'node:fs'
import path from 'node:path'

export type AuthConfig =
  | { mode: 'off' }
  | { mode: 'broken'; reason: string }
  | { mode: 'oidc'; issuer: string; internal: string; clientId: string; secret: string; origins: string[]; groups: string[] }

const read = (file: string): string => { try { return readFileSync(file, 'utf8').trim() } catch { return '' } }

export function loadConfig(env: Record<string, string | undefined> = process.env, readFile: (f: string) => string = read): AuthConfig {
  const mode = env.HUB_AUTH ?? 'off'
  if (mode === 'off') return { mode: 'off' }
  if (mode !== 'oidc') return { mode: 'broken', reason: `HUB_AUTH must be off or oidc, not ${mode}` }
  const dir = env.HUB_OIDC_DIR || '/var/run/hub/oidc'
  const issuer = (env.HUB_OIDC_ISSUER || readFile(path.join(dir, 'issuer'))).replace(/\/$/, '')
  const secret = env.HUB_OIDC_CLIENT_SECRET_FILE ? readFile(env.HUB_OIDC_CLIENT_SECRET_FILE) : readFile(path.join(dir, 'client-secret'))
  const origins = (env.HUB_PUBLIC_URLS || readFile(path.join(dir, 'public-urls'))).split(/[,\s]+/).filter(Boolean).map((u) => u.replace(/\/$/, ''))
  const clientId = env.HUB_OIDC_CLIENT_ID || 'central-hub-app'
  const missing = [!issuer && 'issuer', !secret && 'client secret', origins.length === 0 && 'public URLs'].filter(Boolean)
  if (missing.length) return { mode: 'broken', reason: `sign-in is on but not configured: ${missing.join(', ')}` }
  if (!/^https:\/\//.test(issuer) || origins.some((o) => !/^https:\/\/[^/]+$/.test(o))) return { mode: 'broken', reason: 'issuer and public URLs must be https origins' }
  // Token and key requests may go in-cluster (plain HTTP to the Keycloak Service); the browser always uses the issuer.
  const internal = (env.HUB_OIDC_INTERNAL_URL || issuer).replace(/\/$/, '')
  const groups = (env.HUB_OIDC_ALLOWED_GROUPS || '').split(',').map((g) => g.trim()).filter(Boolean)
  return { mode: 'oidc', issuer, internal, clientId, secret, origins, groups }
}
