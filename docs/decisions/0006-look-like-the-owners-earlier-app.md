# 0006: Look like the owner's earlier app, on the slate palette

Status: accepted by the agents (reviewer pass required), 2026-11-21. Decider: an agent pick; Jon can change it. Prompted by Jon, 2026-11-21: "the central-hub-app does not look like hill90-app did."

**Decision.** The app takes the structure and feel of hill90-app's UI: the mountain mark top left, a top bar with a centred search box, an icon side menu that collapses to icons, rounded cards, stat tiles with icon boxes, and a filled green primary button, with the current menu item tinted green. Colours stay the slate tokens. The slate standard's rules 2, 3 and 5 are rewritten to allow this (square corners, green on links only and no logo came from the first slate pass and are what made the app look different).

**Why.** The owner's words are the requirement; the old look was captured by running hill90-app locally and screenshotting it (`docs/evidence/hill90-home-desktop.png`), then compared with the new one (`docs/evidence/hill-look-desktop.png`). Its mark already uses the slate greys, so the slate palette and the old look agree.

| Option | Why not |
|---|---|
| Keep the quiet slate rules and only restyle some pages | It is the thing the owner rejected |
| Copy hill90's Tailwind classes and components as they are | Tailwind and next-auth would come with them; the plain CSS keeps tokens in one file and the part list short |
| Inline SVG icons by hand | More code to keep; `lucide-react` is the same set the old app used (ISC licence, pinned, over 14 days old) |

**Exit path.** `lucide-react` is imported only in `src/components/` and `src/app/` page files; swapping it touches those imports. The mark is one component, `HillLogo.tsx`; delete it and its line in `Shell.tsx`. A different theme is a new set of values in `tokens.css`.

**Not proven.** The bell, theme toggle and avatar of the old top bar are not here: nothing real feeds them yet (no notifications, no per-person choice, sign-in is off). A real phone was not tried.
