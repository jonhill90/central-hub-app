import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// For the platform's probes: public even with sign-in on, and it reads nothing, so it shows nothing.
export function GET() {
  return NextResponse.json({ status: 'ok' })
}
