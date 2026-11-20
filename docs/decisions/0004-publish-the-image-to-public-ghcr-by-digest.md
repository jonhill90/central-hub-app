# 0004: Publish the app image to public GHCR, pulled by digest

Status: proposed. Date: 2026-11-20. Decider: Jon (an agent pick until he says otherwise).

**Decision.** The app image is built from `Dockerfile` in this repository and pushed to the public GitHub Container Registry only by a workflow that runs on a push to `main`, using the built-in `GITHUB_TOKEN` with `packages: write`. Pull-request workflows never push and never hold a write token. The cluster pulls anonymously and by digest, and a digest bump is a reviewed pull request in the platform repository. No image automation watches the registry.

**Why.** The platform's activation gate keeps write tokens out of pull-request code and forbids image automation. A public registry needs no pull credential in the cluster. Docker Hub is out: the platform keeps no Docker account or credential.

**Alternatives.** Docker Hub (needs an account). A self-hosted registry (Zot) now (more to run before there is an app worth running; it is the exit path). Building on the cluster (needs build tooling and credentials there).

**Exit path.** Move the image to a self-hosted Zot registry: change the push step and the image name in the deploy folder. Nothing in the app depends on where the image lives.

**Not proven.** That GHCR keeps free public images; that an anonymous pull works from the cluster.
