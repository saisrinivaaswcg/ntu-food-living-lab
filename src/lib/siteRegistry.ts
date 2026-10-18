/**
 * The sites as currently set up: the demo sites, with any beds and areas edited on this device
 * (Beds & plants on a site page). The log store keeps this up to date before it notifies readers,
 * so lookups and metrics always see the edited beds. Components read sites through useLogs().
 */
import { sites as baseSites } from '../data'
import type { Site, SiteId } from '../types'

let current: Site[] = baseSites
let byId = new Map(current.map((s) => [s.id, s]))

export function getSites(): Site[] {
  return current
}

export function getSiteById(id: SiteId): Site | undefined {
  return byId.get(id)
}

/** Called by the log store only. */
export function setSites(next: Site[]): void {
  current = next
  byId = new Map(next.map((s) => [s.id, s]))
}
