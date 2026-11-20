# Spec 0002: the read-only agent sheet page (frozen once merged)

One file per agent, settings as YAML on top and notes below. The app only reads and shows it. Pickers and saving are later specs.

## Why files, and where they come from

Jon's answers of 2026-10-13 (given in the project chat and recorded in the agent notebook's agent-sheet draft, which is private, so this public repository cannot link to it): one file per agent, plain agent vocabulary (no fantasy captions), kept in git. Slice 1 reads sample sheets from `catalog/agents/` in this repository. The module that reads them is the only one that does (`src/lib/agents.ts`), so the source can later move to an API or another repository without touching any page.

## The rules the page must not break

1. Stats are earned: "equipped", "available" and "evaluated" are separate facts. The page never shows a level or a rating.
2. Unknown stays `unknown`: a missing or unknown value is shown as unknown, never as zero or as a guess.
3. Authority is policy, not personality. The page shows the sheet's ceiling and says the effective permission is the intersection with the dispatch record and the session policy, so it can only be narrower.
4. Credentials are referenced by mode, never stored: a sheet with a secret-looking key or value is rejected.
5. The page says plainly that a sheet shows what an agent is meant to be, not what it is running as.
6. Agent vocabulary only: the field `party` of the earlier draft is `coordination` here.

## Sheet shape (`schema: agent-sheet/0.1`)

Required top-level keys, 16 in all: `schema`, `id`, `name`, `revision`, `owner`, `purpose`, `runtime`, `capabilities`, `equipment`, `authority`, `budgets`, `memory`, `interface`, `coordination`, `lifecycle`, `evaluations`. They carry the draft's ten fields: field 1 (identity) is the first six keys, fields 2 to 8 are one key each (`runtime` to `interface`), field 9 (coordination and lifecycle) is the keys `coordination` and `lifecycle`, and field 10 is `evaluations`. The page shows these as ten sections. Any value may be the string `unknown`.

## Requirements

| # | Requirement | Test that proves it |
|---|---|---|
| 1 | A valid sheet loads; a sheet missing a required key is rejected with the key named | `tests/agents.test.ts` |
| 2 | A sheet whose id differs from its file name, or two sheets with one id, are rejected | `tests/agents.test.ts` |
| 3 | A sheet holding a secret-looking key (`password`, `secret`, `api_key`, `token_value`) or a value starting `sk-` or `ghp_` is rejected | `tests/agents.test.ts` |
| 4 | Unknown values stay `unknown` in the view model; an absent optional value is also `unknown`, never empty or zero | `tests/agents.test.ts` |
| 5 | The view model has ten sections in a fixed order and no level, rating or score | `tests/agents.test.ts` |
| 6 | Only `src/lib/agents.ts` reads sheet files; components import no `fs` | `tests/seam.test.ts` |
| 7 | The Agents link is in the menu; an unknown agent id returns 404 | `tests/nav.test.ts`, the screenshot run |
| 8 | The sample sheets carry no hostname, address or secret | the hygiene check in CI |
| 9 | `npm run lint`, `npm test`, `npm run build` pass and `npm audit --omit=dev` reports 0 | the CI app job, which gets an `npm audit --omit=dev` step in the code pull request |

## Not in this spec

Pickers, saving (a pull request from the page needs a write credential, which is Jon's to give), reading the notebook's sheets, live status, sign-in.

## Exit path

The sheet reader sits behind `getAgents()`. Replace `src/lib/agents.ts` with an API client and nothing else changes. The sheet files are plain Markdown with YAML on top and are readable by any editor.
