# 0002: Show agent sheets from files, read-only, and reject secrets

Status: proposed. Date: 2026-11-20. Decider: Jon (his three answers of 2026-10-13 on the sheet; the build order is an agent pick).

**Decision.** The app shows an agent's sheet from a Markdown file with YAML on top, read-only first. The sheet reader is one module. Sheets with secret-looking content are rejected at load.

**Why.** Files in git keep every change reviewed and reversible, and they keep the sheet usable without this app. Read-only first needs no credential. Pickers and saving come later, saving only with a write credential Jon gives.

**Exit path.** Swap `src/lib/agents.ts` for an API client; the sheet files stay valid on their own.

**Revisit when.** Jon accepts or changes the sheet schema, or sheets move to another repository.
