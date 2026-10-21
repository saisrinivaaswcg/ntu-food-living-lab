import { BarChart3, ClipboardPen, Handshake, Inbox, LayoutDashboard, Shovel, Trophy, type LucideIcon } from 'lucide-react'
import { paths, type SiteTool } from '../../lib/paths'
import type { RoleKind, SiteId } from '../../types'

export interface WorkspaceNavItem {
  label: string
  icon: LucideIcon
  /** Where it goes, for the site the workspace is looking at. */
  to: (siteId: SiteId) => string
  /** Only match the exact path. */
  end?: boolean
  /** A tool for one site: the site switcher keeps you on it when you change site. */
  tool?: SiteTool
  group: 'today' | 'site' | 'admin'
  /** Only these roles see it. Default: committee and admin. */
  roles?: RoleKind[]
}

export const NAV_GROUP_LABELS: Record<WorkspaceNavItem['group'], string> = {
  today: 'Your work',
  site: 'Site tools',
  admin: 'Sustainability Office',
}

/** Every page in the workspace sidebar. Add a page here when it exists, never before (no dead links). */
export const workspaceNav: WorkspaceNavItem[] = [
  { label: 'Today', icon: LayoutDashboard, to: () => paths.workspace, end: true, group: 'today' },
  { label: 'Log', icon: ClipboardPen, to: () => paths.log(), group: 'today' },
  { label: 'Dashboards', icon: BarChart3, to: () => paths.dashboard(), group: 'today' },
  { label: 'Manage site', icon: Shovel, to: (id) => paths.siteTool(id, 'manage'), tool: 'manage', group: 'site' },
  { label: 'Interest inbox', icon: Inbox, to: (id) => paths.siteTool(id, 'inbox'), tool: 'inbox', group: 'site' },
  { label: 'Handover', icon: Handshake, to: (id) => paths.siteTool(id, 'handover'), tool: 'handover', group: 'site' },
  { label: 'Hall Garden Cup', icon: Trophy, to: () => paths.competition, group: 'admin', roles: ['admin'] },
]
