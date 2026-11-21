# 0005: Sign in with OpenID Connect on node:crypto, no auth library

Status: accepted by the agents (reviewer pass required), 2026-11-21. Decider: an agent pick; Jon can change it.

**Decision.** The app signs visitors in through the platform's Keycloak with the authorization code flow, written on `node:crypto` (spec 0007). No auth library is added.

**Why.** The flow is small (one redirect, one token call, one signature check) and fully testable here. A library (Auth.js, openid-client, jose) would add a dependency to a repository whose rule 6 wants each part listed, pinned and at least 14 days old, and each would pull its own transitive tree; the build at pod start runs `npm ci` on a small node, so a smaller tree is also a faster, lighter build. The risk of hand-written crypto is held down by using only primitives from the standard library (RS256 verify, HMAC, HKDF, SHA-256), refusing everything but RS256, and testing each rejection (spec 0007 requirement 1).

| Option | Why not |
|---|---|
| Auth.js | Large tree, its own session and database ideas, moves fast |
| openid-client | Good, but one more pin, and the flow is two HTTP calls here |
| A proxy in front (oauth2-proxy) | A second part to run per app; the app would still need to know the user. Reasonable later if more apps want the same front |

**Exit path.** Delete `src/proxy.ts`, `src/lib/auth/`, `src/app/auth/`; or swap the files in `src/lib/auth/` for a library behind the same `decide()` guard.

**Not proven.** The code has had no outside review; the reviewer thread's pass and the tests are the review. A later move to a library is cheap and acceptable.
