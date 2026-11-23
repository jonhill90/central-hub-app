import type { NextRequest } from 'next/server'
import { localHub } from '@/lib/hub'
import { answer } from '@/lib/notebook-route'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return answer(() => localHub.notebook.folder(req.nextUrl.searchParams.get('path') ?? ''))
}
