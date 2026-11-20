# Spec 0006: menu groups, the phone drawer and the command palette (frozen once merged)

The first pieces taken from the owner's earlier app (`services/ui` in `jonhill90/hill90-app`: its collapsible menu groups, its mobile drawer and its command palette), rewritten here without its logo, sign-in, Tailwind or icon library, and built from the catalog. This app is the owner's front door to the platform, so these are how he moves around it.

## What is added

- `Sidebar` becomes a client component that receives the nav as plain data. Each area is a collapsible group; the group holding the current page is open, the others closed. The current link carries `aria-current="page"`.
- A phone top bar (under 720 px) with a Menu button that opens the same menu as a drawer from the left; Escape, a click on the backdrop or following a link closes it. Focus goes into the drawer when it opens and back to the button when it closes.
- `CommandPalette`: Ctrl+K or Cmd+K (or a Search button) opens a box; typing filters every area, room and top link by name; arrow keys move, Enter opens, Escape closes. The matching is a pure function, `filterLinks` in `src/lib/palette.ts`.
- `StatusBadge` (exists) is shown on room cards with its word; nothing here invents a status.

## Rules

1. Components receive data as props from `src/lib/hub.ts` through the layout; none reads a file or the catalog (spec 0001 line 4).
2. Everything works with the keyboard alone; every control has a visible name and a visible focus.
3. No new dependency: no icon library, no CSS framework. Colours come from the slate tokens.
4. With scripts off, the menu is still a plain list of links.

## Requirements

| # | Requirement | Test that proves it |
|---|---|---|
| 1 | `filterLinks` matches by case-insensitive substring on the name, ranks names that start with the query first, and returns every link for an empty query | `tests/palette.test.ts` |
| 2 | `filterLinks` returns nothing for a query that matches nothing, and never returns a link that is not in the nav | `tests/palette.test.ts` |
| 3 | `groupOpen(nav, pathname)` opens exactly the group that holds the current page, and none on the home page | `tests/palette.test.ts` |
| 4 | Pages and components import data only from `src/lib/hub.ts` (as before, with the new components included) | `tests/seam.test.ts` |
| 5 | No hex colour and no new dependency in the new files | `tests/slate.test.ts` and `docs/standards/components.md` check in CI |
| 6 | The built app serves the menu as plain links without scripts | `contract/menu.test.ts` (fetches `/` and counts the links) |

## Not proven

The drawer, focus handling and palette keyboard behaviour are checked by hand with screenshots in `docs/evidence` (a browser run), not by an automated test; there is no browser test in CI yet. A real phone is not tested.

## Exit path

Each component is one file and takes plain props. Drop one by deleting its file and its line in the layout.

## Changes after merge

- 2026-11-20 (the code PR): requirement 6 is proven by the CI step "Menu is plain links without scripts", not by `contract/menu.test.ts`, because the contract suite must know nothing of this app's pages (spec 0003). The row above is left as merged.
