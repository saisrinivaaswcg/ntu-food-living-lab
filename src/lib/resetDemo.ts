/**
 * "Reset demo data": everything done on this device goes, and the demo data is back as it shipped.
 * Used by Admin (keeps the admin role) and by showcase mode after 90 seconds idle (back to Visitor).
 */
import type { DemoRole } from '../types'
import { resetCommunity } from './communityStore'
import { resetLogStore } from './logStore'

const PREFIX = 'ntu-food-living-lab:'
/** The two stores rewrite their own keys; everything else with our prefix (checklist ticks, last site) goes. */
const STORE_KEYS = ['ntu-food-living-lab:v1', 'ntu-food-living-lab:community:v1']

export function resetDemoData(keepRole?: DemoRole): void {
  resetLogStore()
  resetCommunity(keepRole)
  try {
    const stale: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(PREFIX) && !STORE_KEYS.includes(key)) stale.push(key)
    }
    stale.forEach((key) => localStorage.removeItem(key))
  } catch {
    // Storage blocked: the stores are already reset in memory for this visit.
  }
}
