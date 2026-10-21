import { siteName } from '../../lib/lookups'
import { BEGINNER_RATING_LABELS, type CropAtNtu } from '../../lib/metrics'
import type { Crop } from '../../types'
import type { TagAnchors } from './plantDrawings'

export type TagKey = keyof TagAnchors

export interface Tag {
  key: TagKey
  letter: string
  figure: string
  label: string
  detail: string
}

export function buildTags(crop: Crop, at: CropAtNtu): Tag[] {
  const typical = crop.daysToFirstHarvest
  return [
    {
      key: 'stem',
      letter: 'a',
      figure: at.survival === null ? 'No data' : `${Math.round(at.survival * 100)}%`,
      label: 'of plants survived',
      detail:
        at.plantings > 0
          ? `${at.plantsPlanted} plants, ${at.plantings} ${at.plantings === 1 ? 'planting' : 'plantings'} at ${at.siteIds.length} ${at.siteIds.length === 1 ? 'site' : 'sites'}`
          : 'Not planted at NTU yet',
    },
    {
      key: 'leaf',
      letter: 'b',
      figure: at.medianDays === null ? `~${typical}` : `Day ${Math.round(at.medianDays)}`,
      label: at.medianDays === null ? 'days to first harvest (typical)' : 'median first harvest',
      detail:
        at.medianDays === null
          ? 'No first harvest logged at NTU yet'
          : `Typical: ${typical} days. From ${at.medianFrom} ${at.medianFrom === 1 ? 'planting' : 'plantings'}`,
    },
    {
      key: 'base',
      letter: 'c',
      figure: at.bestSite ? siteName(at.bestSite.siteId, true) : 'Too early',
      label: at.bestSite ? 'grows it best' : 'to name a best site',
      detail: at.bestSite
        ? `${(at.bestSite.kgPerPlant * 1000).toFixed(0)} g per plant over ${at.bestSite.harvests} harvests`
        : 'Needs two or more harvests at a site',
    },
    {
      key: 'top',
      letter: 'd',
      figure: BEGINNER_RATING_LABELS[at.rating],
      label: 'for a first-time grower',
      detail: at.ratingReasons.join(', '),
    },
  ]
}

