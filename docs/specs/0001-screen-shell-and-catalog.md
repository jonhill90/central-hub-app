# Spec 0001: the screen shell and a Hub home built from the catalog (frozen once merged)

| # | Requirement | Test that proves it |
|---|---|---|
| 1 | Every catalog record has owner, docs link (https) and exit path | `tests/catalog.test.ts` |
| 2 | A room naming an unknown area or link is rejected | `tests/catalog.test.ts` |
| 3 | The same catalog gives the same menu; a room not in the catalog has no link | `tests/nav.test.ts` |
| 4 | Only `src/lib/catalog.ts` reads files; components import no `fs`, database or server action | `tests/seam.test.ts` |
| 5 | Light and dark themes meet 4.5:1 text contrast | `tests/contrast.test.ts` |
| 6 | `npm run build` passes; an unknown room returns 404 | CI build step; screenshot run |
