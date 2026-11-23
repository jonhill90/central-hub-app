export function NotebookSearch({ q = '' }: { q?: string }) {
  return (
    <form action="/notebook/search" method="get" role="search" className="nb-search">
      <input type="search" name="q" defaultValue={q} placeholder="Search the notebook by title, tag or description" aria-label="Search the notebook" />
      <button className="btn primary" type="submit">Search</button>
    </form>
  )
}
