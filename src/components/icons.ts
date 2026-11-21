import { Server, Box, BookOpen, Hammer, Cloud, Folder, type LucideIcon } from 'lucide-react'

/** Presentation only: which icon an area gets. An area with no entry here gets a folder; nothing is hidden for lacking one. */
const AREA_ICONS: Record<string, LucideIcon> = {
  'home-lab': Server,
  'vps-apps': Box,
  'notebook-library': BookOpen,
  workshop: Hammer,
  azure: Cloud,
}

export const areaIcon = (id: string): LucideIcon => AREA_ICONS[id] ?? Folder
