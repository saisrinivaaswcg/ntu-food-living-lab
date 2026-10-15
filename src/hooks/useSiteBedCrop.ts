import { useMemo, useState } from 'react'
import { findSite } from '../lib/lookups'
import { currentPlantingByBed } from '../lib/metrics'
import { getLastSiteId } from '../lib/preferences'
import type { CropId, PlantingLog, SiteId } from '../types'
import { useLogs } from './useLogs'

/**
 * Site → bed → crop selection shared by the harvest, planting and failure forms.
 * Preselects the site last used on this device; the bed list follows the site;
 * with autoFillCrop, choosing a bed fills in the crop from that bed's current planting.
 */
export function useSiteBedCrop({ autoFillCrop }: { autoFillCrop: boolean }) {
  const { logs } = useLogs()
  const [siteId, setSiteId] = useState<SiteId | ''>(() => getLastSiteId() ?? '')
  const [bedId, setBedId] = useState('')
  const [cropId, setCropId] = useState<CropId | ''>('')
  const [cropFromBed, setCropFromBed] = useState(false)

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
