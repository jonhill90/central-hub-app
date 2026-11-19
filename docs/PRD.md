# Product requirements (one page)

## What it is
A web app that maps the Central Hub lab: areas and rooms drawn from catalog files, each with status, owner, docs link and exit path. A catalog record only describes; it grants nothing.

## For whom
Jon, and the agents who work for him (later through the same API).

## Pillars
Measured against the eight pillars of Central Hub (six industry pillars plus Replaceability and Understandability).

| Pillar | How the app meets it | Proof |
|---|---|---|
| Reliability | Slice 1 reads local files only; later status calls show `unknown` on failure | tests, later slice |
| Security | No sign-in yet; later OIDC; no secret or private name in the repo | CI hygiene check |
| Operational excellence | Pull requests, docs in the same change, one pipeline | CI |
| Cost optimisation | Free and open-source parts, one container | `docs/standards/components.md` |
| Performance efficiency | Small catalog files, no database | build output |
| Sustainability | Runs on spare capacity | deploy folder, later |
| **Replaceability** | Six seams below | `tests/seam.test.ts`, contract tests later |
| **Understandability** | One-page PRD, glossary, README with a does-not list | review |

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
