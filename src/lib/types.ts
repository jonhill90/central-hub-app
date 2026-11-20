export type Status = 'not connected' | 'parked' | 'ok' | 'unknown'

export interface Area {
  id: string
  name: string
  summary: string
  owner: string
  docs: string
  exit_path: string
  status: Status
}

export interface Room extends Area {
  area: string
  links: string[]
}

export interface Catalog {
  areas: Area[]
  rooms: Room[]
}
