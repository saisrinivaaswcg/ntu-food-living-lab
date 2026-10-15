/**
 * Derived numbers, as pure functions over LogCollections.
 * Definitions live in docs/SPEC.md → Metric definitions.
 */
import { crops } from '../data'
import type { CropId, LogCollections, PlantingLog, Site } from '../types'

const cropOrder = new Map(crops.map((c, i) => [c.id, i]))

/** Latest first: by date, then by when the record was created. */
function isLater(a: PlantingLog, b: PlantingLog): boolean {
  return a.date !== b.date ? a.date > b.date : a.createdAt > b.createdAt
}

/**
 * What each bed is growing now: the crop of its most recent planting, unless
 * failures on that bed since the planting have wiped out every plant.
 * Beds with nothing growing are left out of the map.
 */
export function currentPlantingByBed(
  logs: Pick<LogCollections, 'plantings' | 'failures'>,
  site: Site,
): Map<string, PlantingLog> {
  const bedIds = new Set(site.beds.map((b) => b.id))
  const latest = new Map<string, PlantingLog>()
  for (const p of logs.plantings) {
    if (p.siteId !== site.id || !bedIds.has(p.bedId)) continue
    const current = latest.get(p.bedId)
    if (!current || isLater(p, current)) latest.set(p.bedId, p)
  }

  for (const [bedId, planting] of latest) {
    const lost = logs.failures
      .filter((f) => f.bedId === bedId && f.cropId === planting.cropId && f.date >= planting.date)
      .reduce((sum, f) => sum + f.estimatedLossPlants, 0)
    if (lost >= planting.quantity) latest.delete(bedId)
  }
  return latest
}

/** Distinct crops currently growing at a site, in controlled-vocabulary order. */
export function cropsCurrentlyGrowing(
  logs: Pick<LogCollections, 'plantings' | 'failures'>,
  site: Site,
): CropId[] {
  const ids = new Set([...currentPlantingByBed(logs, site).values()].map((p) => p.cropId))
  return [...ids].sort((a, b) => (cropOrder.get(a) ?? 0) - (cropOrder.get(b) ?? 0))
}
