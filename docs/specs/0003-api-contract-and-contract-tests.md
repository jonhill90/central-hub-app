# Spec 0003: the Hub API contract and the contract tests (frozen once merged)

The seam that matters for a later Rust backend. The pages ask one client for data; the client talks to an HTTP API described in OpenAPI; a contract test suite says what any backend must do. Today the backend is a thin TypeScript layer inside this app. Tomorrow it can be a Rust service that passes the same tests.

## What is added

- `openapi/hub-api.yaml`: OpenAPI 3.1 with two read-only operations, `GET /api/v1/catalog` (areas and rooms) and `GET /api/v1/agents` (agent sheets as the ten-section view), and the schemas of their answers. Nothing else: no write, no auth yet.
- `src/lib/hub.ts`: the one client. Pages import it and nothing else for data. It has two implementations behind one interface `HubApi`: `local` (reads through `catalog.ts` and `agents.ts`, as today) and `http` (calls `HUB_API_URL`). `HUB_API_MODE` picks one; the default stays `local`.
- `src/app/api/v1/catalog/route.ts` and `src/app/api/v1/agents/route.ts`: the thin layer, one route handler each, built from the same local readers.
- `contract/`: the contract tests. They take `HUB_API_URL`, call the API over HTTP and check each answer against the schemas in `openapi/hub-api.yaml`. They know nothing about this app's code.

## Rules

1. The contract file, not the code, is the source of truth for the shape of an answer.
2. A backend replaces this layer only by passing `npm run contract` against its URL.
3. The API is read-only and carries no secret: sheets with secret-looking content never reach it (spec 0002 requirement 3 still holds at load).
4. Status is never invented: an answer carries `unknown` or `not connected` as the files say.
5. No private name, hostname or address appears in the contract or in the sample answers.

## Requirements

| # | Requirement | Test that proves it |
|---|---|---|
| 1 | `openapi/hub-api.yaml` parses, is OpenAPI 3.1, and defines exactly the two read-only operations | `contract/openapi.test.ts` |
| 2 | `GET /api/v1/catalog` answers 200 with a body valid against the catalog schema | `contract/catalog.test.ts` |
| 3 | `GET /api/v1/agents` answers 200 with a body valid against the agents schema, each agent having ten sections | `contract/agents.test.ts` |
| 4 | An unknown path under `/api/v1/` answers 404, and a non-GET method answers 405 | `contract/errors.test.ts` |
| 5 | The `http` client and the `local` client return equal data for the same catalog | `tests/hub-client.test.ts` |
| 6 | Pages import data only from `src/lib/hub.ts`; only `hub.ts` and the route handlers import `catalog.ts` or `agents.ts` | `tests/seam.test.ts` |
| 7 | A contract test fails when a backend answer is wrong (a mutated answer is rejected by the schema check) | `contract/mutation.test.ts` |
| 8 | CI builds the app, starts it, and runs `npm run contract` against it | the CI app job |
| 9 | `npm run lint`, `npm test`, `npm run build` pass and `npm audit --omit=dev` reports 0 | the CI app job |

## Dependencies

One new development dependency for schema checks (an MIT-licensed JSON Schema validator, newest release at least 14 days old, listed in `docs/standards/components.md` in the code pull request). No production dependency is added.

## Not in this spec

A Rust backend, sign-in, writes, the image build and deploy. A Rust service is a separate repository's work; this spec only makes sure it has a contract to pass.

## Exit path

The contract and its tests are plain files and tools any language can use. To drop the TypeScript layer, point `HUB_API_URL` at the new service and set `HUB_API_MODE=http`; delete `src/app/api/v1/` when it passes `npm run contract`.
