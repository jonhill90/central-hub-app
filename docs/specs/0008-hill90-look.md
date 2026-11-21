# Spec 0008: the owner's earlier look, on slate (frozen once merged)

Brings the shell and pages to the look of hill90-app, in the slate palette. Decision 0006 says why; the slate standard holds the new rules.

## What is added

- `HillLogo` (the mountain mark, filled from tokens) in a top bar with a centred search box that opens the command palette.
- The side menu gets an icon per item (`lucide-react`), a chevron per group, a tinted current item, and a collapse button (icons only, remembered in the browser; labels stay in the page for screen readers).
- Rounded cards and tiles, icon boxes, and a filled primary button; the Hub page shows counts (areas, rooms, agents, parked) read from the catalog and the agent sheets, nothing invented.
- Tokens `--accent-fill`, `--on-accent`, `--logo-light`, `--logo-dark`; `--radius` is `8px`.
- Evidence screenshots in `docs/evidence` (`hill90-home-desktop.png` for the old look, `hill-look-*.png` for the new).

## Rules

1. Slate standard rules 1 to 6 as rewritten hold. No colour value appears outside `tokens.css`.
2. With scripts off, the menu is still a plain list of links (spec 0006 rule 4 stands).
3. Components still get data only through `src/lib/hub.ts` (spec 0001 line 4).

## Requirements

| # | Requirement | Test that proves it |
|---|---|---|
| 1 | Token values equal the standard's table, including the new tokens and `--radius: 8px` | `tests/slate.test.ts` |
| 2 | `border-radius` is set only through `--radius`, half of it, or `50%` | `tests/slate.test.ts` |
| 3 | `--accent` appears only in link, current-item and icon-box rules; the primary button is filled from `--accent-fill` | `tests/slate.test.ts` |
| 4 | White on `--accent-fill`, and accent on the tinted current item, reach 4.5:1 in both themes; muted text reads on `--bg` | `tests/contrast.test.ts` |
| 5 | No hex colour outside `tokens.css` | `tests/slate.test.ts` |
| 6 | The built app still serves at least 15 menu links without scripts | the CI step "Menu is plain links without scripts" |
| 7 | The pages still import data only from `src/lib/hub.ts` | `tests/seam.test.ts` |

## Not proven

Collapse, drawer and palette were driven once in a headless browser with screenshots (`docs/evidence/hill-look-collapsed.png`, `hill-look-phone-drawer.png`); no browser test runs in CI. The bell, theme toggle and avatar are not built. A real phone is not tested.

## Exit path

See decision 0006.
