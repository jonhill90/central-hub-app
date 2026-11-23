import { NextResponse } from 'next/server'
import { localHub } from '@/lib/hub'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await localHub.systems.proxmox())
}
