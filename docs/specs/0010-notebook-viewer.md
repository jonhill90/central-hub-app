# Spec 0010: the notebook viewer

The app shows the agents' notebook from its own files (decision 0007). Read-only.

## Requirements

| # | Requirement | Test that proves it |
|---|---|---|
| 1 | With no `HUB_NOTEBOOK_DIR`, or a folder that is not there, the app says so and shows nothing else; it never invents notes | `tests/notebook.test.ts` "says plainly when no notebook is connected" |
| 2 | The root lists its folders and notes, counts the notes, and names its README | `tests/notebook.test.ts` "counts and lists the notes" |
| 3 | A note's title is its front matter title, else its first heading, else its file name; its front matter shows as properties and a heading equal to the title is not shown twice | `tests/notebook.test.ts` "titles come from front matter…", "shows front matter as properties…" |
| 4 | A relative link to another note stays in the app; `[[id]]`, `[[id|text]]` and `[[title]]` resolve to a note; one that resolves to none is plain text | `tests/notebook.test.ts` "a link to another note stays in the app…" |
| 5 | Raw HTML, `javascript:`/`data:` links and images never run; code keeps what it says | `tests/notebook.test.ts` "raw HTML and javascript: links never run…" |
| 6 | A path that climbs out of the folder, a dot folder, a non-note or a missing note is refused (400 or 404) | `tests/notebook.test.ts` "refuses a path that climbs out…" |
| 7 | Search needs every word to match the title, tags, description or path, and ranks title hits first | `tests/notebook.test.ts` "search ranks a title hit…" |
| 8 | Only `src/lib/notebook.ts` reads the notebook folder, and pages reach it only through `src/lib/hub.ts` | `tests/seam.test.ts` |
| 9 | While `HUB_AUTH` is not `oidc` the notebook is closed (503, "sign-in is off"), because the notebook is private; `HUB_ALLOW_OPEN_DATA=yes` opens it for tests and a laptop | `tests/notebook.test.ts` "stays closed while sign-in is off…" |
| 10 | The four API paths answer 503 with no notebook and match `openapi/hub-api.yaml` with one | `contract/notebook.test.ts` |

## Pages

`/notebook` (root, search box), `/notebook/search?q=`, `/notebook/<path>` (a folder, or a `.md` note). API: `/api/v1/notebook`, `/folder?path=`, `/note?path=`, `/search?q=`.

## Not in this spec

Images and other files, editing, backlinks, and how the checkout gets to the pod.
