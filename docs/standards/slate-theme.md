# Standard: the slate theme

The look of this app. A theme changes only tokens (colour, corner radius, font); layout, spacing and the meaning of status colours never change with it. Dark slate is the default; light slate follows the browser's light setting, and the sun/moon button in the top bar overrides both (saved in the browser, `data-theme` on the page).

## Rules

1. Cool greys on a blue-grey base. The four slate greys `#7a8e96`, `#60757d`, `#4c5a63`, `#3c4a52` anchor the palette (dark `--border` is the last one; light `--muted` is the third). The surfaces `--bg`, `--surface` and `--raised` are darker or lighter steps in the same hue, an agent pick, not values taken from those greys.
2. Rounded corners through one token: `--radius` is `8px`. Nothing in `src/styles/` sets a border radius other than through `--radius` (or half of it, for a key cap), except status dots (`50%`) and status chips and the avatar (a pill, `999px`, and a circle).
3. Green means "you can act here or you are here": links, the current menu item, icon boxes, the border of the focused search box, and the filled primary button. Fill and text of the button come from `--accent-fill` and `--on-accent`, not from `--accent`. Green is not used for badges, borders of cards or page backgrounds.
4. Status colours are tinted chips (the colour as text on a 16% fill of itself over the surface), never a solid bar. One colour per state, everywhere: waiting amber, doing blue, ready green, blocked red, idea violet, parked grey. A chip always carries its word, never colour alone.
5. The mountain mark sits at the top left, filled from `--logo-light` and `--logo-dark` (two of the four slate greys). No gradient across text, no glow, no neon.
6. Every pair in the table below reaches 4.5:1 (WCAG 2.2 AA); a test checks it.

## Tokens

| Token | Dark slate | Light slate | Used for |
|---|---|---|---|
| `--bg` | `#11171a` | `#eef1f3` | page background |
| `--surface` | `#1a2227` | `#ffffff` | cards, side menu |
| `--raised` | `#232d33` | `#e4e9ec` | chips, hovered rows |
| `--border` | `#3c4a52` | `#c3cdd2` | lines |
| `--text` | `#e2e8ec` | `#1c2428` | body text |
| `--muted` | `#9aabb2` | `#4c5a63` | labels, captions |
| `--accent` | `#6db33a` | `#3b7316` | links, the current menu item, icon boxes, the focused search border |
| `--accent-hover` | `#86c653` | `#2c5a0f` | link hover |
| `--accent-fill` | `#4a8024` | `#3b7316` | primary button fill |
| `--on-accent` | `#ffffff` | `#ffffff` | text on the primary button |
| `--logo-light`, `--logo-dark` | `#7a8e96`, `#4c5a63` | same | the mountain mark |
| `--radius` | `8px` | `8px` | corners |

Measured contrast on `--surface` (dark): text 13.05, muted 6.79, link 6.27, link hover 7.85. Light: 15.76, 7.12, 5.75, 8.15. On `--raised`: muted 5.92 (dark) and 5.82 (light); link 5.46 and 4.7.

## Where it comes from

The navy surfaces and the green `#6db33a` are the palette of the owner's own earlier app (`services/ui/src/app/globals.css` in `jonhill90/hill90-app`, public), and its mountain mark is already drawn in these four slate greys. This app keeps that app's look (mark, top bar, icon menu, rounded cards, tiles, green primary button) on the slate surfaces. Until 2026-11-21 this standard asked for square corners, no logo and green on links only; the owner said the app did not look like his earlier one, and decision 0006 replaced those rules.

## Exit path

All colours are CSS variables in `src/styles/tokens.css`. A new theme is a new set of values; no component names a colour.
