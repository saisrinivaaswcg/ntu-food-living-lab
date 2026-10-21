import { BarChart3, ClipboardPen, Map, Sprout, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Only match the exact path (for "/"). */
  end?: boolean
  /** Only shown to roles that use the workspace (committee, admin). */
  workspace?: boolean
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Explore', icon: Map, end: true },
  { to: '/log', label: 'Log', icon: ClipboardPen, workspace: true },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/sites', label: 'Sites', icon: Sprout },
]
