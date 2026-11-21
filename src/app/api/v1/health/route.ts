import { NextResponse } from 'next/server'
import { loadConfig } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

// For the platform's probes: public, always 200 while the process runs, and it shows only whether sign-in is
// off, on, or on but not configured. It never shows a name or a secret. Everything else stays closed when
// sign-in is not configured (spec 0007 rule 2), so a pod that starts before its Secrets exist is up but shut.
export function GET() {
  const m = loadConfig().mode
  return NextResponse.json({ status: 'ok', signIn: m === 'oidc' ? 'on' : m === 'off' ? 'off' : 'not configured' })
}
