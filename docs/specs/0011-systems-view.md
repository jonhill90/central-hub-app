# Spec 0011: the systems view

The app shows what a system reported, and when. It never calls the system and never changes it. First system: Proxmox.

## How the data arrives

The platform writes a JSON snapshot into the folder `HUB_FEED_DIR` (default `/var/run/hub/feed`) as `proxmox.json`: `generatedAt` (ISO time) and `resources`, a list of nodes, guests (`qemu`, `lxc`) and storage with status, cpu, memory, disk and uptime. The app keeps only those fields. Like the notebook, it is closed while `HUB_AUTH` is not `oidc` (`HUB_ALLOW_OPEN_DATA=yes` for tests).

## Requirements

| # | Requirement | Test that proves it |
|---|---|---|
| 1 | Only known fields with checked types are kept; a record that is not a resource is dropped; a secret-looking extra field never reaches the page | `tests/systems.test.ts` "keeps only known fields…" |
| 2 | The page says how old the snapshot is, and marks it stale after 2 hours | `tests/systems.test.ts` "says how old the snapshot is…" |
| 3 | A snapshot that is not JSON or has no time shows a reason instead of data; a missing file says no snapshot has been delivered | `tests/systems.test.ts` "a snapshot that is not JSON…", "reads proxmox.json…" |
| 4 | While sign-in is off the view is closed | `tests/systems.test.ts` "reads proxmox.json from HUB_FEED_DIR, and is closed while sign-in is off" |
| 5 | Only `src/lib/systems.ts` reads the feed folder, and pages reach it only through `src/lib/hub.ts` | `tests/seam.test.ts` |
| 6 | `/api/v1/systems/proxmox` matches `openapi/hub-api.yaml` | `contract/systems.test.ts` |

## Not in this spec

Buttons that change a system. A click would be an apply, so it needs its own spec and review. Unknown values show as `unknown`, never as zero.
