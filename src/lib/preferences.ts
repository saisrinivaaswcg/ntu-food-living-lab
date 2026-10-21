/** Per-device conveniences, kept apart from the log store. */
import type { SiteId } from '../types'
import { findSite } from './lookups'

const LAST_SITE_KEY = 'ntu-food-living-lab:last-site'

/** The site this device last logged for, so forms can preselect it. */
export function getLastSiteId(): SiteId | null {
  try {
    return findSite(localStorage.getItem(LAST_SITE_KEY) ?? undefined)?.id ?? null
  } catch {
    return null
  }
}

export function setLastSiteId(id: SiteId): void {
  try {
    localStorage.setItem(LAST_SITE_KEY, id)
  } catch {
    // Storage blocked or full — the form still works, it just won't preselect next time.
  }
}

const WORKSPACE_SITE_KEY = 'ntu-food-living-lab:workspace-site'
const workspaceSiteListeners = new Set<() => void>()

export function subscribeWorkspaceSite(listener: () => void): () => void {
  workspaceSiteListeners.add(listener)
  return () => workspaceSiteListeners.delete(listener)
}

/** The site Admin last looked at in the workspace, so site tools reopen on it. */
export function getWorkspaceSiteId(): SiteId | null {
  try {
    return findSite(localStorage.getItem(WORKSPACE_SITE_KEY) ?? sessionWorkspaceSite ?? undefined)?.id ?? null
  } catch {
    return findSite(sessionWorkspaceSite ?? undefined)?.id ?? null
  }
}

let sessionWorkspaceSite: SiteId | null = null

export function setWorkspaceSiteId(id: SiteId): void {
  sessionWorkspaceSite = id
  try {
    localStorage.setItem(WORKSPACE_SITE_KEY, id)
  } catch {
    // Storage blocked or full: the switcher still works for this visit (sessionWorkspaceSite).
  }
  workspaceSiteListeners.forEach((l) => l())
}
