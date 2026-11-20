# Product requirements (one page)

Everything below describes the plan. Nothing is built yet; each "proof" names the spec 0001 test or later check that will prove it.

## What it is
A web app that maps the Central Hub lab: areas and rooms drawn from catalog files, each with status, owner, docs link and exit path. A catalog record only describes; it grants nothing.

## For whom
Jon, and the agents who work for him (later through the same API).

## Pillars
Measured against the eight pillars of Central Hub (six industry pillars plus Replaceability and Understandability).

| Pillar | How the app meets it | Proof (all planned, none exists yet) |
|---|---|---|
| Reliability | Slice 1 reads local files only; later status calls show `unknown` on failure | later slice, with its own spec |
| Security | No sign-in yet; later OIDC; no secret or private name in the repo | CI hygiene check (this PR's workflow checks it today) |
| Operational excellence | Pull requests, docs in the same change, one pipeline | planned: a docs check in CI |
| Cost optimisation | Free and open-source parts, one container | planned: `docs/standards/components.md` kept in step with `package.json` |
| Performance efficiency | Small catalog files, no database | planned: build size in the PR |
| Sustainability | Runs on spare capacity | later, with the deploy folder |
| **Replaceability** | Six seams below | planned: spec 0001 line 4 (`tests/seam.test.ts`); contract tests later |
| **Understandability** | One-page PRD, glossary, README with a does-not list | planned: a reader answers "what does it read?" from the README (README arrives with the code) |

## Swappable parts and their exit paths

| Part | Contract | Exit path |
|---|---|---|
| Catalog source | `Catalog` type in `src/lib/types.ts` | Replace `src/lib/catalog.ts` with an API client; nothing else changes |
| Backend | HTTP API as OpenAPI (later) | A Rust service that passes the same contract tests |
| Agent sheets | One file per agent (later) | Plain files; any reader |
| Sign-in | Standard OIDC (later) | Any OIDC provider |
| Look | CSS variables in `src/styles/tokens.css` | Edit one file |
| Run | One container image | Any container host |

## Not now
Sign-in, backend, agent sheets, live status, deploy. Each is its own spec.
