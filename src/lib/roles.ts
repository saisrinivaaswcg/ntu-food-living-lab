/**
 * What each demo role can do. Pages use these to hide controls a role can't use, so nothing is a dead
 * button. Definitions: docs/SPEC.md → Routes and roles.
 */
import { ADMIN_TEAM } from '../data'
import type { DemoRole, RoleKind, Site, SiteId, StudentProfile } from '../types'
import { siteName } from './lookups'

export const ROLE_LABELS: Record<RoleKind, string> = {
  visitor: 'Visitor',
  student: 'Student',
  committee: 'Committee member',
  admin: 'Admin',
}

export const isAdmin = (role: DemoRole): boolean => role.kind === 'admin'

/** Committee members and Admin use the workspace (Log, Dashboards, site tools). */
export const usesWorkspace = (role: DemoRole): boolean => role.kind === 'committee' || role.kind === 'admin'

/** Log, edit entries and change setup for this site: its own committee, or Admin. */
export function canEditSite(role: DemoRole, siteId: SiteId): boolean {
  return role.kind === 'admin' || (role.kind === 'committee' && role.siteId === siteId)
}

/** The sites this role can log for and manage (none for visitors and students). */
export function editableSites(role: DemoRole, sites: Site[]): Site[] {
  if (role.kind === 'admin') return sites
  if (role.kind === 'committee') return sites.filter((s) => s.id === role.siteId)
  return []
}

/** The site a workspace page opens on: the committee's own site, otherwise none (all sites). */
export function homeSiteId(role: DemoRole): SiteId | null {
  return role.kind === 'committee' ? role.siteId : null
}

/** Who the pill says you are, e.g. "Mei Tan (Student)" or "Hall 12 committee". */
export function roleName(role: DemoRole, profile: StudentProfile | null): string {
  switch (role.kind) {
    case 'visitor':
      return 'Visitor'
    case 'student':
      return profile ? `${profile.name} (Student)` : 'Student'
    case 'committee':
      return `${siteName(role.siteId, true)} committee`
    case 'admin':
      return `Admin (${ADMIN_TEAM})`
  }
}

/** Shorter form for tight spaces (the phone header). */
export function roleShortName(role: DemoRole, profile: StudentProfile | null): string {
  switch (role.kind) {
    case 'student':
      return profile?.name.split(' ')[0] ?? 'Student'
    case 'committee':
      return 'Committee'
    default:
      return ROLE_LABELS[role.kind]
  }
}

/** Where each role lands after choosing it on /login (unless the link asked for a page with ?next=). */
export function landingFor(role: DemoRole): string {
  switch (role.kind) {
    case 'committee':
    case 'admin':
      return '/log'
    default:
      return '/'
  }
}
