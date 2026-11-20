# Spec 0005: the slate theme (frozen once merged)

Gives the app its look, from `docs/standards/slate-theme.md`. Tokens and the rules that read them only; no new page and no new component.

## What is added

- `src/styles/tokens.css`: dark slate as the default and light slate under `prefers-color-scheme: light`, with the token names of the standard (`--raised` replaces `--accent-bg`; `--warn` and `--warn-bg` stay for the parked badge, in slate colours).
- `src/styles/app.css`: square corners through `--radius`; badges and the "needs" bar use neutral tokens, not the green; green appears only on links.
- `tests/contrast.test.ts` and a new `tests/slate.test.ts`.
- Two screenshots (dark and light) in `docs/evidence`.

## Rules

1. Rules 1 to 6 of the slate standard hold.
2. No colour value appears outside `tokens.css` (components and `app.css` use variables only).

## Requirements

| # | Requirement | Test that proves it |
|---|---|---|
| 1 | Every text pair of both themes reaches 4.5:1 | `tests/contrast.test.ts` |
| 2 | `--radius` is `0` in both themes and `app.css` sets `border-radius` only through `--radius` (a status dot may use `50%`) | `tests/slate.test.ts` |
| 3 | `--accent` is used only in link rules and nowhere else in `app.css` | `tests/slate.test.ts` |
| 4 | No hex colour appears in `app.css` or in `src/` outside `tokens.css` | `tests/slate.test.ts` |
| 5 | The token values equal the standard's table | `tests/slate.test.ts` |
| 6 | `lint`, `test`, `build` and the contract pass | the CI `app` job |

## Not in this spec

The menu groups, the phone drawer, the command palette and status chips as a component: spec 0006. Not proven here: how the theme looks on a real phone; checked by a screenshot at phone width only.

## Exit path

Delete `tokens.css`' slate values and put another set under the same names; the tests then fail until the standard changes with them.
