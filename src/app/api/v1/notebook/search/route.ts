import type { NextRequest } from 'next/server'
import { localHub } from '@/lib/hub'
import { answer } from '@/lib/notebook-route'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return answer(async () => ({ notes: await localHub.notebook.search(req.nextUrl.searchParams.get('q') ?? '') }))
}
