# central-hub-app

A web app that shows the Central Hub lab as a map: **areas** (home lab, VPS apps, notebook and library, workshop, Azure parked) and the **rooms** inside them. The side menu and every page are built from catalog files in `catalog/`, so adding a room is a file change, not a code change.

Status: first slice. It is a plain web UI from standard parts, not a game.

## Run it

```
npm ci
npm run lint && npm test && npm run build
npm run dev        # http://localhost:3000
```

## What it reads and does (disclosure)

| It does | It does not |
|---|---|
| Read `catalog/areas.yaml` and `catalog/rooms/*.yaml` from disk, in one module (`src/lib/catalog.ts`) |
| Read agent sheets from `catalog/agents/*.md` (YAML on top, notes below) in one module (`src/lib/agents.ts`), and show them read-only at `/agents`; a sheet with a secret-looking key or value is rejected | Sign anyone in or edit a sheet (pickers and saving are later specs) |
| Show every record's status as `not connected` or `parked`, never a guessed value | Call a backend, a database, the lab or the internet |
| Serve pages from one container (`output: standalone`) | Hold a secret, a hostname or a private network name |

## The container image

```
docker build -t hub-app .
docker run --read-only --tmpfs /tmp -p 3000:3000 hub-app
```

CI builds and tests this image on every pull request (the `image` job). Nothing is pushed anywhere yet: where the image is stored is open (decision 0004).

## The API and its contract

Pages get data through one client, `src/lib/hub.ts`. It has a `local` mode (default) and an `http` mode (`HUB_API_MODE=http`, `HUB_API_URL=...`). The API is read-only and described in `openapi/hub-api.yaml` (`/api/v1/catalog`, `/api/v1/agents`). A replacement backend is acceptable when it passes the contract tests against its URL:

```
HUB_API_URL=http://127.0.0.1:3000 npm run contract
```

## Swappable parts

Each part has an exit path; see [docs/PRD.md](docs/PRD.md).

## Rules

See [AGENTS.md](AGENTS.md). Branch, then pull request; docs change in the same pull request as the code.
