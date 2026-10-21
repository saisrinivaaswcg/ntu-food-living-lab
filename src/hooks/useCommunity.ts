import { useMemo, useSyncExternalStore } from 'react'
import { handovers as demoHandovers } from '../data'
import type { HandoverRecord, SiteId } from '../types'
import { getCommunitySnapshot, subscribeCommunity, type CommunitySnapshot } from '../lib/communityStore'

/** Live view of the demo role, profile and everything else in the community store. */
export function useCommunity(): CommunitySnapshot {
  return useSyncExternalStore(subscribeCommunity, getCommunitySnapshot, getCommunitySnapshot)
}

/** Just the current demo role. */
export function useRole() {
  return useCommunity().role
}

/** The crop vocabulary, including crops a committee added on this device. */
export function useCrops() {
  return useCommunity().crops
}

/** A site's handover records, newest first: demo ones plus those made with the wizard on this device. */
export function useHandovers(siteId: SiteId): HandoverRecord[] {
  const device = useCommunity().handovers
  return useMemo(
    () =>
      [...demoHandovers, ...device]
        .filter((h) => h.siteId === siteId)
        .sort((a, b) => b.date.localeCompare(a.date) || (b.source === 'user' ? 1 : 0) - (a.source === 'user' ? 1 : 0)),
    [device, siteId],
  )
}
