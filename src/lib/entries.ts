/** Any log record as one list entry, for "Recent entries" on the Log page. */
import { compostOptions, destinationOptions, failureCauseOptions, propagationOptions } from '../data'
import type { FailureLog, HarvestLog, LogCollections, LogKind, PlantingLog, WeeklyInputLog } from '../types'
import { formatNumber } from './format'
import { cropName, getBed, siteName } from './lookups'

export type Entry =
  | { kind: 'harvests'; record: HarvestLog }
  | { kind: 'plantings'; record: PlantingLog }
  | { kind: 'weeklyInputs'; record: WeeklyInputLog }
  | { kind: 'failures'; record: FailureLog }

export const ENTRY_KIND_LABELS: Record<LogKind, { one: string; many: string }> = {
  harvests: { one: 'Harvest', many: 'Harvests' },
  plantings: { one: 'Planting', many: 'Plantings' },
  weeklyInputs: { one: 'Weekly inputs', many: 'Weekly inputs' },
  failures: { one: 'Plant loss', many: 'Losses' },
}

export const entryDate = (e: Entry): string => (e.kind === 'weeklyInputs' ? e.record.weekStart : e.record.date)

/** Every record except site-setup ones, newest first. */
export function allEntries(logs: LogCollections): Entry[] {
  const entries: Entry[] = [
    ...logs.harvests.map((record): Entry => ({ kind: 'harvests', record })),
    ...logs.plantings.filter((p) => p.source !== 'setup').map((record): Entry => ({ kind: 'plantings', record })),
    ...logs.weeklyInputs.map((record): Entry => ({ kind: 'weeklyInputs', record })),
    ...logs.failures.map((record): Entry => ({ kind: 'failures', record })),
  ]
  return entries.sort((a, b) => {
    const d = entryDate(b).localeCompare(entryDate(a))
    return d !== 0 ? d : b.record.createdAt.localeCompare(a.record.createdAt)
  })
}

const bedLabel = (siteId: Entry['record']['siteId'], bedId: string) => getBed(siteId, bedId)?.label ?? bedId
const label = <T extends string>(options: { value: T; label: string }[], value: T) =>
  options.find((o) => o.value === value)?.label ?? value

/** One line saying what the entry is, e.g. "Thai basil, 0.25 kg". */
export function entryTitle(e: Entry): string {
  switch (e.kind) {
    case 'harvests':
      return `${cropName(e.record.cropId)}, ${formatNumber(e.record.weightKg, 2)} kg`
    case 'plantings':
      return `${cropName(e.record.cropId)}, ${formatNumber(e.record.quantity)} plants`
    case 'weeklyInputs':
      return `${formatNumber(e.record.waterLitres)} L water, ${formatNumber(e.record.labourHours, 2)} h`
    case 'failures': {
      const f = e.record
      return `${cropName(f.cropId)}, ${f.estimatedLossPlants}${f.plantsInBed ? ` of ${f.plantsInBed}` : ''} lost${
        f.recoveredPlants ? `, ${f.recoveredPlants} recovered` : ''
      }`
    }
  }
}

/** Where and how, e.g. "Hall 12 · Planter box A · Pantry". */
export function entryDetail(e: Entry): string {
  const site = siteName(e.record.siteId, true)
  switch (e.kind) {
    case 'harvests':
      return `${site} · ${bedLabel(e.record.siteId, e.record.bedId)} · ${label(destinationOptions, e.record.destination)}`
    case 'plantings':
      return `${site} · ${bedLabel(e.record.siteId, e.record.bedId)} · ${label(propagationOptions, e.record.propagation)}`
    case 'weeklyInputs':
      return `${site} · ${e.record.compostType === 'none' ? 'no compost' : `${e.record.compostKg} kg ${label(compostOptions, e.record.compostType).toLowerCase()}`}`
    case 'failures':
      return `${site} · ${bedLabel(e.record.siteId, e.record.bedId)} · ${label(failureCauseOptions, e.record.cause)}`
  }
}
