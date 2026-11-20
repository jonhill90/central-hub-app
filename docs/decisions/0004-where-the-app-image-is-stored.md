# 0004: Where the app image is stored (open; no registry chosen)

Status: proposed, and the choice is not made. Date: 2026-11-20. Decider: Jon (an agent pick until he says otherwise).

**Decision.** For now the image is only built and tested in pull-request CI; nothing is pushed anywhere. The registry is chosen in a later record, before the first deploy. This record keeps the options so that choice is quick.

**Why not decide now.** Every option has a gap that is not closed today:

| Option | Gap |
|---|---|
| Public GitHub Container Registry, pushed from `main` with the built-in token | GitHub's documentation says a package first published to a personal account is private by default, and that making it public is a one-time step in the package settings that cannot be undone. The cluster's anonymous pull fails until someone does it, and that needs Jon's own sign-in, which no agent has |
| Self-hosted Zot registry in the lab | Not built yet; needs a push path from CI that holds a credential outside pull requests |
| Private registry with a read-only pull secret from the secrets store | The secrets store is not proven yet |

**Fixed whatever is chosen.** Pushes happen only from a workflow on a push to `main`, never on `pull_request`; consumers pull by digest, bumped by a reviewed pull request; no image automation; no Docker Hub account (the platform keeps none).

**Recommendation (agent pick).** Zot, once the secrets store is proven, because it is the exit path of every other option and needs no browser step. Until then the app is runnable from source and from a locally built image.

**Exit path.** The image is a plain file built from `Dockerfile`; any registry takes it. Nothing in the app depends on where it lives.

**Not proven.** The GitHub visibility behaviour is read from its documentation, not tried.
