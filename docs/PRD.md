# Product requirements (one page)

The first slice (screen shell and Hub home) is built. Each "proof" below says whether it exists or is still planned.

## What it is
A web app that maps the Central Hub lab: areas and rooms drawn from catalog files, each with status, owner, docs link and exit path. A catalog record only describes; it grants nothing.

## For whom
Jon, and the agents who work for him (later through the same API).

## Pillars
Measured against the eight pillars of Central Hub (six industry pillars plus Replaceability and Understandability).

| Pillar | How the app meets it | Proof (exists / planned) |
|---|---|---|
| Reliability | Slice 1 reads local files only; later status calls show `unknown` on failure | planned: later slice, with its own spec |
| Security | No sign-in yet; later OIDC; no secret or private name in the repo | exists: the hygiene grep in `.github/workflows/ci.yml`, on every pull request |
| Operational excellence | Pull requests, docs in the same change, one pipeline | exists: the required-files check in CI; planned: link and spec-test checks |
| Cost optimisation | Free and open-source parts, one container | planned: `docs/standards/components.md` kept in step with `package.json` |
| Performance efficiency | Small catalog files, no database | planned: build size in the PR |
| Sustainability | Runs on spare capacity | later, with the deploy folder |
| **Replaceability** | Six seams below | exists: spec 0001 line 4, `tests/seam.test.ts`; planned: contract tests |
| **Understandability** | One-page PRD, glossary, README with a does-not list | exists: the README says what it reads and does not do; a reader check is planned |

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
