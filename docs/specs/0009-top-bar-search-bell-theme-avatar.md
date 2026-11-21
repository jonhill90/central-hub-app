# Spec 0009: top bar search, bell, theme toggle and avatar (frozen once merged)

Finishes the look of hill90-app (decision 0006, spec 0008): its top bar has a search box you type into, a bell, a theme toggle and an avatar. Jon, 2026-11-21: "we have no search"; he wants it to look like the old layout.

## What is added

- A real search box in the top bar (a text input, not a button). Typing lists matching areas, rooms and pages (the same `filterLinks` as the palette); arrows and Enter pick; Escape closes. Ctrl+K or Cmd+K focuses it on a wide screen and opens the palette on a phone. On a phone only a search icon shows, which opens the palette.
- Bell: opens a small panel. Nothing reports to the hub yet, so it says "Nothing is waiting"; no sample items are shown.
- Theme toggle: sun or moon button; sets `data-theme` on the page and saves it in the browser (`localStorage`, failure caught). Without a saved choice the system setting applies as before.
- Avatar: a round neutral mark (`--raised`, not green, so it does not read as a signed-in account) with a person icon. Sign-in is off, so it carries no name; its hover title and its screen-reader name say "Not signed in". It is hidden on a phone.
- Status chips are pills.
- Tokens: `:root[data-theme="light"]` and `:root[data-theme="dark"]` give the same values as the system-setting blocks.

## Requirements

| # | Requirement | Test that proves it |
|---|---|---|
| 1 | The chosen light theme has exactly the values of the system light theme; the chosen dark is the default dark block | `tests/topbar.test.ts` |
| 2 | The top bar has a search input, the bell, the toggle and the avatar | `tests/topbar.test.ts` |
| 3 | The theme choice is saved and read back, and a blocked browser store is caught | `tests/topbar.test.ts` |
| 4 | The bell holds no invented items; the avatar says "Not signed in" | `tests/topbar.test.ts` |
| 4a | `--accent-fill` appears only in the `.btn.primary` rules (normal and hover) | `tests/slate.test.ts` |
| 5 | All earlier slate and contrast checks still pass; the built page still has at least 15 menu links without scripts | `tests/slate.test.ts`, `tests/contrast.test.ts`, the CI step "Menu is plain links without scripts" |

## Not proven

Search typing, the bell panel and the toggle were driven once in a headless browser (screenshots in `docs/evidence/topbar-*.png`); no browser test runs in CI. The avatar shows no person until sign-in is on. A real phone is untried.

## Exit path

Delete `src/components/TopBarTools.tsx` and its line in `Shell.tsx`; the search input is one block in `Shell.tsx`.
