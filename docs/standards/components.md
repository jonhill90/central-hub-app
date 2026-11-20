# Component register

Every part, its licence and its pin. Licences are the fields in each package's `package.json` as installed; confirm before release.

| Part | Version | Role | Exit path |
|---|---|---|---|
| next | 16.4.5 | Web framework | Any React renderer or a plain SPA behind the same catalog module |
| react, react-dom | 19.0.0 | UI | Same |
| yaml | 2.9.1 | Reads catalog files | Any YAML parser |
| typescript | 5.9.3 | Types and `lint` | None needed |
| vitest | 3.2.7 | Tests | Any test runner |
| @types/node, @types/react, @types/react-dom | 25.2.3, 19.2.14, 19.2.3 | Type definitions only, dev | Drop with TypeScript. `@types/react` is newer than `react` 19.0.0 and the type check passes; align when react is bumped |

Next 16.3.0 was replaced by 16.4.5 on 2026-11-20 after `npm audit --omit=dev` reported a critical advisory on 16.3.0 (GHSA-2464-fhr4-w9xw). 16.4.5 was published 2026-11-03, so it meets the 14-day pin rule; `npm audit --omit=dev` on it reports 0 vulnerabilities.
