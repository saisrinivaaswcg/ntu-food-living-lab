import { useMemo, useState } from 'react'
import { crops } from '../data'
import { findSite } from '../lib/lookups'
import { currentPlantingByBed } from '../lib/metrics'
import { getLastSiteId } from '../lib/preferences'
import { getCommunitySnapshot } from '../lib/communityStore'
import { canEditSite } from '../lib/roles'
import type { CropId, PlantingLog, SiteId } from '../types'
import { useLogs } from './useLogs'

/**
 * Site → bed → crop selection shared by the harvest, planting and failure forms.
 * Preselects the site last used on this device; the bed list follows the site;
 * with autoFillCrop, choosing a bed fills in the crop from that bed's current planting.
 */
export function useSiteBedCrop({
  autoFillCrop,
  initial,
}: {
  autoFillCrop: boolean
  /** Pre-fill, e.g. from a "Ready soon" card. Ignored unless the site, bed and crop all exist. */
  initial?: { siteId?: string | null; bedId?: string | null; cropId?: string | null }
}) {
  const { logs } = useLogs()
  const [start] = useState(() => {
    const site = findSite(initial?.siteId ?? undefined)
    if (site && !canEditSite(getCommunitySnapshot().role, site.id)) return null
    const bed = site?.beds.find((b) => b.id === initial?.bedId)
    const crop = crops.find((c) => c.id === initial?.cropId)
    return site && bed && crop ? { siteId: site.id, bedId: bed.id, cropId: crop.id } : null
  })
  const [siteId, setSiteId] = useState<SiteId | ''>(() => {
    if (start) return start.siteId
    // A committee logs for its own site; Admin starts on the site last used on this device.
    const role = getCommunitySnapshot().role
    if (role.kind === 'committee') return role.siteId
    const last = getLastSiteId()
    return last && canEditSite(role, last) ? last : ''
  })
  const [bedId, setBedId] = useState(start?.bedId ?? '')
  const [cropId, setCropId] = useState<CropId | ''>(start?.cropId ?? '')
  const [cropFromBed, setCropFromBed] = useState(Boolean(start))

  const site = findSite(siteId || undefined)
  const currentByBed = useMemo(
    () => (site ? currentPlantingByBed(logs, site) : new Map<string, PlantingLog>()),
    [logs, site],
  )

  const changeSite = (id: SiteId) => {
    if (id === siteId) return
    setSiteId(id)
    setBedId('')
    if (cropFromBed) setCropId('')
    setCropFromBed(false)
  }

  const changeBed = (id: string) => {
    setBedId(id)
    if (!autoFillCrop) return
    const planting = currentByBed.get(id)
    if (planting) {
      setCropId(planting.cropId)
      setCropFromBed(true)
    } else if (cropFromBed) {
      setCropId('')
      setCropFromBed(false)
    }
  }

  const changeCrop = (id: CropId) => {
    setCropId(id)
    setCropFromBed(false)
  }

  /** Clear bed and crop for the next entry; keep the site. */
  const resetBedAndCrop = () => {
    setBedId('')
    setCropId('')
    setCropFromBed(false)
  }

  return {
    siteId,
    bedId,
    cropId,
    cropFromBed,
    site,
    /** The planting currently on the chosen bed, if any. */
    currentPlanting: bedId ? currentByBed.get(bedId) : undefined,
    currentByBed,
    changeSite,
    changeBed,
    changeCrop,
    resetBedAndCrop,
  }
}

export type SiteBedCrop = ReturnType<typeof useSiteBedCrop>
