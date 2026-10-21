import { BookOpen, HeartHandshake, LayoutDashboard, Map, Sprout, type LucideIcon } from 'lucide-react'
import { paths } from '../../lib/paths'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Only match the exact path (for "/"). */
  end?: boolean
  /** Only shown to roles that use the workspace (committee, admin). */
  workspace?: boolean
}

/** The public side's main links. Add a page here when it exists, never before (no dead links). */
export const navItems: NavItem[] = [
  { to: paths.explore, label: 'Explore', icon: Map, end: true },
  { to: paths.sites, label: 'Sites', icon: Sprout },
  { to: paths.learn, label: 'Learn', icon: BookOpen },
  { to: paths.join, label: 'Join', icon: HeartHandshake },
  { to: paths.workspace, label: 'Workspace', icon: LayoutDashboard, workspace: true },
]
