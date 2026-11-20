# 0003: Put an OpenAPI contract between the pages and the data

Status: proposed. Date: 2026-11-20. Decider: Jon. Per the coordinator's brief of 2026-11-19, he wants a Rust backend later and every part swappable (the Central Hub replaceability pillar); both are recorded in the project's private agent notebook, so this public repository cannot link to them. The shape of this seam is an agent pick.

**Decision.** Pages get data from one client. The client talks to a read-only HTTP API described in OpenAPI 3.1. A contract test suite, written against the HTTP API only, decides whether a backend is acceptable. The first backend is a thin TypeScript layer in this app.

**Why.** Swapping a backend then costs one URL and a passing test suite, not a rewrite. Describing the contract as a file, not as code, keeps it usable from Rust.

**Alternatives.** Reading files directly from pages (today; fastest, but the seam is code, not a contract). GraphQL (more machinery than two read-only lists need).

**Exit path.** Delete `src/app/api/v1/` and point the client at another service that passes `npm run contract`. The OpenAPI file stays valid on its own.

**Revisit when.** The API needs writes or sign-in, or a second client appears.
