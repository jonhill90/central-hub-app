import { NextResponse } from 'next/server'
import { NotebookError } from './hub'

/** Run a notebook read and turn a NotebookError into its JSON answer (400, 404 or 503). */
export async function answer<T>(run: () => Promise<T>): Promise<NextResponse> {
  try { return NextResponse.json(await run()) } catch (e) {
    if (e instanceof NotebookError) return NextResponse.json({ error: e.message }, { status: e.status })
    throw e
  }
}
