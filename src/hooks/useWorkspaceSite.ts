import { useSyncExternalStore } from 'react'
import { useParams } from 'react-router-dom'
import { findSite } from '../lib/lookups'
import { getWorkspaceSiteId, subscribeWorkspaceSite } from '../lib/preferences'
import { canEditSite } from '../lib/roles'
import type { Site } from '../types'
import { useRole } from './useCommunity'
import { useLogs } from './useLogs'

/**
 * The site the workspace is looking at: the one in the URL on site-tool pages, otherwise the committee's
 * own site, or the site Admin last picked. `canEdit` is false when a committee views another site.
 */
export function useWorkspaceSite(): { site: Site | undefined; canEdit: boolean; fromUrl: boolean } {
  const { siteId } = useParams()
  const role = useRole()
  const { sites } = useLogs()
  const picked = useSyncExternalStore(subscribeWorkspaceSite, getWorkspaceSiteId, getWorkspaceSiteId)
  const fromUrl = siteId !== undefined
  const site = fromUrl
    ? findSite(siteId)
    : (findSite(role.kind === 'committee' ? role.siteId : (picked ?? undefined)) ?? sites[0])
  return { site, canEdit: site ? canEditSite(role, site.id) : false, fromUrl }
}
