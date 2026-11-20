# Component register

Every part, its licence and its pin. Licences are the fields in each package's `package.json` as installed; confirm before release.

| Part | Version | Role | Exit path |
|---|---|---|---|
| next | 16.3.0 | Web framework | Any React renderer or a plain SPA behind the same catalog module |
| react, react-dom | 19.0.0 | UI | Same |
| yaml | 2.9.1 | Reads catalog files | Any YAML parser |
| typescript | 5.9.3 | Types and `lint` | None needed |
| vitest | 3.2.7 | Tests | Any test runner |
