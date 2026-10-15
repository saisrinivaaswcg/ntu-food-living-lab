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
