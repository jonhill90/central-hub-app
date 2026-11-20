import type { Status } from '@/lib/types'

export function StatusBadge({ status }: { status: Status }) {
  return <span className={status === 'parked' ? 'badge parked' : 'badge'}>{status}</span>
}
