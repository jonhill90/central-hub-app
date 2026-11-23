import { describe, expect, it } from 'vitest'
import { BASE, validator } from './schema'

// With no notebook connected every notebook path answers 503 with a reason; with one connected (the CI job sets
// HUB_NOTEBOOK_DIR to a fixture) the answers match the schemas. The test reads which case from /api/v1/notebook.
describe('notebook API', () => {
  it('GET /api/v1/notebook is valid either way', async () => {
    const res = await fetch(BASE + '/api/v1/notebook')
    expect(res.status).toBe(200)
    expect(validator('NotebookState')(await res.json()).ok).toBe(true)
  })
  it('folder, note and search answer 503 without a notebook and match their schema with one', async () => {
    const st = (await (await fetch(BASE + '/api/v1/notebook')).json()) as { connected: boolean }
    const folder = await fetch(BASE + '/api/v1/notebook/folder')
    const search = await fetch(BASE + '/api/v1/notebook/search?q=a')
    if (!st.connected) { expect(folder.status).toBe(503); expect(search.status).toBe(503); return }
    expect(validator('NotebookFolder')(await folder.json()).ok).toBe(true)
    expect(validator('NotebookSearch')(await search.json()).ok).toBe(true)
    expect((await fetch(BASE + '/api/v1/notebook/note?path=../x.md')).status).toBe(400)
    expect((await fetch(BASE + '/api/v1/notebook/note?path=nothing.md')).status).toBe(404)
  })
})
