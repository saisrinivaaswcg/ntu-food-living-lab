import { BookOpen, CalendarCheck, HeartHandshake, LayoutDashboard, Map, Sprout, Trophy, type LucideIcon } from 'lucide-react'
import { paths } from '../../lib/paths'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Only match the exact path (for "/"). */
  end?: boolean
  /** Only shown to roles that use the workspace (committee, admin). */
  workspace?: boolean
  /** Shorter label for the phone tab bar */
  phoneLabel?: string
  /** Left out of the phone tab bar (still in the top nav and the footer), to keep it to five tabs. */
  desktopOnly?: boolean
}

/** The public side's main links. Add a page here when it exists, never before (no dead links). */
export const navItems: NavItem[] = [
  { to: paths.explore, label: 'Explore', icon: Map, end: true },
  { to: paths.sites, label: 'Sites', icon: Sprout, desktopOnly: true },
  { to: paths.learn, label: 'Learn', icon: BookOpen },
  { to: paths.join, label: 'Join', icon: HeartHandshake },
  { to: paths.getInvolved, label: 'Get involved', phoneLabel: 'Help out', icon: CalendarCheck },
  { to: paths.hallCup, label: 'Hall Cup', icon: Trophy },
  { to: paths.workspace, label: 'Workspace', phoneLabel: 'Work', icon: LayoutDashboard, workspace: true },
]
