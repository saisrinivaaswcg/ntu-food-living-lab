import { useSyncExternalStore } from 'react'
import { getCommunitySnapshot, subscribeCommunity, type CommunitySnapshot } from '../lib/communityStore'

/** Live view of the demo role, profile and everything else in the community store. */
export function useCommunity(): CommunitySnapshot {
  return useSyncExternalStore(subscribeCommunity, getCommunitySnapshot, getCommunitySnapshot)
}

/** Just the current demo role. */
export function useRole() {
  return useCommunity().role
}
