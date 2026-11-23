# Decision 0007: read the notebook from a folder of files, in the app

Status: accepted by the agents on 2026-11-23, on the owner's ask of 2026-11-23 00:48 UTC for a way to view the notebook in the app itself, where it then only linked out to GitHub.

## Decision

The app shows the agents' notebook itself. One module, `src/lib/notebook.ts`, reads a folder of markdown notes at `HUB_NOTEBOOK_DIR` and serves folders, notes, links between notes and search through the same `HubApi` seam as the catalog (local reader, or the HTTP client against `/api/v1/notebook/*`). The platform, not the app, puts the checkout there.

## Why

A link to GitHub is not a view. Files are what the notebook is, so a reader of files is the smallest thing that is real. It adds no database and no call to GitHub from the app.

## Parts

One new part, `marked` 18.1.3 (see `docs/standards/components.md`). The app's renderer escapes raw HTML, drops links that are not http(s), mailto or another note, and shows images as their alt text.

## Exit path

Any reader that answers the same four paths of `openapi/hub-api.yaml` replaces `src/lib/notebook.ts` (set `HUB_API_MODE=http`); the pages do not change.

## Not decided

How the checkout reaches the pod. That is a platform step in the central-hub repository.
