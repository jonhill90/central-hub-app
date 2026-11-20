# Spec 0004: the container image and its push workflow (frozen once merged)

Makes the app runnable as one image. It does not deploy anything. The deploy folder lives in the platform repository under the cluster's `apps` folder and is its own pull request there, after this one is merged and reviewed.

## What is added

- `Dockerfile`: multi-stage, builds the Next.js `standalone` output, runs as a non-root user, listens on one port, runs `node server.js`. Base images are pinned by digest.
- `.dockerignore`: keeps `node_modules`, `.next`, `.git` and local env files out of the build.
- A pull-request CI step that builds the image without pushing, starts it, and runs `npm run contract` against it.
- `.github/workflows/publish.yml`: runs on `push` to `main` only, builds the image and pushes it to public GHCR with `GITHUB_TOKEN` (`packages: write`), tagged with the commit and reporting the digest in its summary. Actions pinned by full sha.
- Decision 0004 and the register rows for each new part.

## Rules

1. No workflow that runs on `pull_request` has `packages: write` or any secret.
2. The image holds no secret, no private name and no catalog data that is not already public in this repository.
3. Nothing pulls by tag; consumers pin the digest.
4. Base images and actions are pinned at least 14 days old and listed in `docs/standards/components.md`.
5. The image runs read-only: it writes nothing outside its temp folder.

## Requirements

| # | Requirement | Test that proves it |
|---|---|---|
| 1 | The image builds in CI on every pull request | the CI `image` job |
| 2 | The running image passes `npm run contract` | the CI `image` job |
| 3 | The container runs as a non-root user | the CI `image` job (checks `id -u` is not 0) |
| 4 | `publish.yml` triggers on `push` to `main` only and is the only file that grants `packages: write` | `tests/workflows.test.ts` |
| 5 | No pull-request workflow grants write permissions or reads a secret | `tests/workflows.test.ts` |
| 6 | Every `uses:` is pinned by full sha and every base image by digest | `tests/workflows.test.ts` |
| 7 | The public-hygiene grep still passes | the CI `docs` job |

## Not in this spec

The deploy folder, an Argo application, a digest bump, sign-in, and any state the app holds. Not proven until the first push: that GHCR accepts the image and an anonymous pull by digest works.

## Exit path

`Dockerfile` is plain; any registry or builder accepts it. To leave GHCR, change the push step and the image name in the deploy folder (decision 0004).
