# Spec 0007: sign in with OpenID Connect (frozen once merged)

The app is the owner's front door to the platform, and the platform already has one sign-in (Keycloak, realm `lab`). This spec puts the app behind it. It is optional and off by default, so local runs, CI and the contract tests are unchanged, and it names no lab address: the platform mounts the names and the secret at run time.

## What is added

- `src/proxy.ts` (Next 16 proxy, Node runtime) runs before every page and API call and asks `decide()` in `src/lib/auth/guard.ts` what to do.
- `src/lib/auth/crypto.ts`: PKCE, the signed cookie and ID-token checking, on `node:crypto` only. No new dependency.
- `src/lib/auth/config.ts`: the settings (README table). The only sign-in file that reads the disk, for the three mounted files.
- `src/lib/auth/flow.ts`: the authorization code flow.
- Routes `/auth/login`, `/auth/callback`, `/auth/logout`, and `/api/v1/health` (public, for probes; not in the OpenAPI contract, which stays the two read-only data operations).

## Rules

1. Authorization code flow with PKCE S256 and a client secret; no implicit flow, no password flow.
2. Fail closed: `HUB_AUTH=oidc` with a missing file, an address that is not https, or an unknown mode answers 503 to every request except the probe. The probe (`/api/v1/health`) stays 200 and says `signIn: not configured`, because the platform starts the pod before it makes the sign-in Secrets (the rebuild waits for every app to be healthy before it makes them); the pod is up but shut.
3. The ID token is trusted only after its RS256 signature, issuer, audience, expiry and nonce check out; `alg` other than RS256 is refused.
4. The session is a signed cookie (HMAC-SHA256, a key per purpose, `session` and `login`, derived from the client secret by HKDF, so the login cookie that anyone can get from `/auth/login` is refused as a session and the reverse), HttpOnly, Secure, SameSite=Lax, 8 hours. Rotating the client secret ends every session.
5. A return address after sign-in is a path on this site only. The host used to build addresses is taken from the request only if it is in the list of public origins.
6. Public without a session: `/auth/*`, `/api/v1/health`, `/_next/*`. Everything else, including the data API, needs a session; a page redirects to sign-in and an API call answers 401.

## Requirements

| # | Requirement | Test that proves it |
|---|---|---|
| 1 | A token with a wrong issuer, audience, nonce, expiry, signature or key, or alg none or HS256, is refused; a good one is accepted | `tests/auth.test.ts`, "ID token check" |
| 2 | The cookie round-trips and fails after tampering, expiry or with another key; the PKCE challenge is the S256 of the verifier | `tests/auth.test.ts`, "session cookie" |
| 3 | Configuration is off by default, read from the mounted files, and broken (never open) when anything is missing or not https | `tests/auth.test.ts`, "configuration fails closed" |
| 4 | The guard: 503 when broken, redirect or 401 without a session, pass with one; only the listed paths are public; return addresses and hosts cannot be bent | `tests/auth.test.ts`, "the guard" |
| 5 | The login address carries PKCE S256, state, nonce and the exact redirect; the callback accepts a matching answer and refuses a wrong state, no or old login cookie, a refused or failed code exchange, a wrong nonce and a group not allowed | `tests/auth.test.ts`, "the code flow" |
| 6 | The built app with sign-in on redirects a page to `/auth/login`, sends `/auth/login` to the provider with PKCE, answers 401 on the data API, 200 on the probe, and 503 on everything else when configured badly | CI step "Sign-in is enforced by the built app" |
| 7 | No new dependency; the reader of the mounted files is the only sign-in file that imports `node:fs` | `tests/seam.test.ts`, `docs/standards/components.md` |
| 8 | The login cookie is refused as a session (by `unseal` and by the guard) and a session cookie is refused as a login cookie. Found by the reviewer on the first head; the test fails on the code before the fix | `tests/auth.test.ts`, "cookies are not interchangeable" |

## Not proven

A real sign-in against a running Keycloak (typing a password) is not in CI; the code exchange is tested against a stand-in. It is proven on the platform by the steps in the platform repository's runbook, up to the provider's own sign-in page. The Keycloak sign-out round trip and a logout link in the page are later. The app trusts the provider's `groups` claim as sent.

## Exit path

Delete `src/proxy.ts`, `src/lib/auth/` and `src/app/auth/`; the app is open again. Another provider works if it offers the code flow with PKCE, RS256 ID tokens, a `groups` claim and a keys address at `<issuer>/protocol/openid-connect/certs` (Keycloak's; others need that one path made configurable).
