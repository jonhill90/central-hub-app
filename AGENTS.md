# Agent rules for this repository

*(`CLAUDE.md` is a symlink to this file.)*

This repository is the Central Hub web app. It follows the rules of the Central Hub platform repository (`jonhill90/central-hub`): its pillars, and above all that every part can be swapped.

## Docs or notebook?

Before saving, ask: is it about this app, saying why it is so, what it is, or how to run or change it?

- **Yes:** documentation. It goes here by pull request, in the kind folder under `docs/` (`decisions`, `specs`, `standards`), or in `README.md`.
- **No, or still working material** (research, measurements, notes): it goes in the agent notebook, `jonhill90/agent-notebook`, which is private. Nothing here links into it.

## Rules

1. Branch and pull request; never push to `main`. Branch `<type>/<short-description>`; PR title `<type>: <summary>`; types `feat fix docs chore refactor ci test revert`. PR body has `Author-Lane: <lane name>`.
2. Merge only green, reviewed pull requests, never by auto-merge.
3. This repository is public: no secrets, hostnames, private network names or personal details.
4. Build every piece so it can be replaced. Each record in `docs/decisions/` names its exit path.
5. Only `src/lib/catalog.ts` reads the catalog; components never touch files or databases (spec 0001 line 4, proved by `tests/seam.test.ts`).
6. Free and open-source parts only, each listed in `docs/standards/components.md`, versions pinned and at least 14 days old.
7. A spec's acceptance line names the test that proves it.
8. A change that alters how to run or change something updates its doc in the same pull request.
