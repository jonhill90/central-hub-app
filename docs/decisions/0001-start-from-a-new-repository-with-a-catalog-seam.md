# 0001: Start from a new repository, with the catalog behind one module

Status: proposed. Date: 2026-11-19. Decider: Jon (his answer of 2026-11-19 05:15 UTC accepted a new repository "for now").

**Decision.** A new public repository, written fresh with patterns taken from the earlier platform's UI (a data-driven side menu and a proxy seam), and no copied history. The catalog is read by one module.

**Why.** The old repository carries eight services, deploys and history with private details. Central Hub's PRD puts apps in their own repositories.

**Exit path.** Merge the code into another repository by copying `src/`, `catalog/` and `docs/`; nothing depends on this repository's name.

**Revisit when.** Jon wants the app inside the platform repository.
