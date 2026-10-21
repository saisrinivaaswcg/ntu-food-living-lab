import type { Bed, Crop, CropId, Site, SiteId } from '../types'
import { getCropById } from './cropRegistry'
import { getSiteById } from './siteRegistry'

export function getSite(id: SiteId): Site {
  const site = getSiteById(id)
  if (!site) throw new Error(`Unknown site: ${id}`)
  return site
}

/** For URL params, which may be anything a user types. */
export function findSite(id: string | undefined): Site | undefined {
  return id ? getSiteById(id as SiteId) : undefined
}

export function getCrop(id: CropId): Crop {
  const crop = getCropById(id)
  if (!crop) throw new Error(`Unknown crop: ${id}`)
  return crop
}

/** For URL params, which may be anything a user types. */
export function findCrop(id: string | undefined): Crop | undefined {
  return id ? getCropById(id) : undefined
}

export function getBed(siteId: SiteId, bedId: string): Bed | undefined {
  return getSiteById(siteId)?.beds.find((b) => b.id === bedId)
}

export function cropName(id: CropId): string {
  return getCropById(id)?.name ?? id
}

export function siteName(id: SiteId, short = false): string {
  const site = getSiteById(id)
  if (!site) return id
  return short ? site.shortName : site.name
}
