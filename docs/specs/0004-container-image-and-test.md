# Spec 0004: the container image and its test (frozen once merged)

Makes the app runnable as one image and proves it in pull-request CI. It pushes nothing and deploys nothing: where the image is stored is open (decision 0004), and the deploy folder lives in the platform repository, as its own pull request after a registry is chosen.

## What is added

- `Dockerfile`: multi-stage, builds the Next.js `standalone` output, runs as a non-root user, listens on one port, runs `node server.js`. Base image pinned by digest.
- `.dockerignore`: keeps `node_modules`, `.next`, `.git` and local env files out of the build.
- A CI job `image`: builds the image (no push), starts it read-only, and runs `npm run contract` against it.
- `tests/workflows.test.ts`: checks the workflow files.
- Register rows for the base image in `docs/standards/components.md`.

## Rules

1. No workflow grants `packages: write` or reads a secret; this spec adds no push step.
2. The image holds no secret and no private name.
3. Nothing is pulled by tag in a deploy; consumers pin a digest (a rule for the later deploy folder).
4. Base images and actions are pinned by digest or full sha, and at least 14 days old.
5. The image runs read-only: it writes nothing outside its temp folder.

## Requirements

| # | Requirement | Test that proves it |
|---|---|---|
| 1 | The image builds in CI on every pull request | the CI `image` job |
| 2 | The running image passes `npm run contract` | the CI `image` job |
| 3 | The container runs as a non-root user | the CI `image` job (`id -u` is not 0) |
| 4 | The container starts and passes the contract with `--read-only` and a temp folder only (rule 5) | the CI `image` job |
| 5 | No workflow grants write permissions to packages or reads a secret | `tests/workflows.test.ts` |
| 6 | Every `uses:` is pinned by full sha and the base image by digest | `tests/workflows.test.ts` |
| 7 | The image holds no private-looking text: the public-hygiene grep also runs over the image's files (rule 2) | the CI `image` job |

## Not proven

That a base image or action is at least 14 days old (rule 4's age part): checked by hand when the register row is written, with no test. Where the image is stored, and anything about a deploy.

## Exit path

`Dockerfile` is plain; any registry or builder accepts it. Delete the `image` job and the file to drop it.
