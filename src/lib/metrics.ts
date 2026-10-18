/**
 * Derived numbers, as pure functions over LogCollections.
 * Definitions live in docs/SPEC.md → Metric definitions.
 */
import { crops, sites } from '../data'
import type {
  CompostType,
  CostAssumptions,
  CropId,
  FailureLog,
  ISODate,
  LogCollections,
  PlantingLog,
  Site,
  SiteId,
  SupermarketPrice,
  WeeklyInputLog,
} from '../types'
import { addDays, mondayOf, todayISO } from './dates'

const cropOrder = new Map(crops.map((c, i) => [c.id, i]))
const siteById = new Map(sites.map((s) => [s.id, s]))

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

/* ------------------------------------------------------------------ */
/* Dashboard: period, filters and anchor date                          */
/* ------------------------------------------------------------------ */

export type PeriodKey = '4w' | '3m' | 'all'
export type SiteFilter = SiteId | 'all'

const PERIOD_WEEKS: Record<Exclude<PeriodKey, 'all'>, number> = { '4w': 4, '3m': 13 }

export interface Period {
  key: PeriodKey
  /** First day included, or null for "all" (no lower bound). */
  start: ISODate | null
  /** Last day included: the anchor date. */
  end: ISODate
  /** Mondays of every week shown on the charts, oldest first. The last one may be in progress. */
  weeks: ISODate[]
  /** Weeks whose Sunday is on or before the anchor date (used for completeness). */
  completeWeeks: ISODate[]
}

/** The latest date anything was logged. Weekly records count from their Monday. */
export function latestLogDate(logs: LogCollections): ISODate | null {
  const dates = [
    ...logs.harvests.map((h) => h.date),
    ...logs.plantings.map((p) => p.date),
    ...logs.failures.map((f) => f.date),
    ...logs.weeklyInputs.map((w) => w.weekStart),
  ]
  return dates.length ? dates.reduce((a, b) => (b > a ? b : a)) : null
}

/** Periods end on the latest logged date, not today, so demo charts stay meaningful after the demo period. */
export function anchorDate(logs: LogCollections): ISODate {
  return latestLogDate(logs) ?? todayISO()
}

const isComplete = (monday: ISODate, anchor: ISODate) => addDays(monday, 6) <= anchor

function mondaysBetween(first: ISODate, last: ISODate): ISODate[] {
  const out: ISODate[] = []
  for (let m = first; m <= last; m = addDays(m, 7)) out.push(m)
  return out
}

/** The last `count` complete weeks up to the anchor date (Mondays, oldest first). */
export function lastCompleteWeeks(anchor: ISODate, count: number): ISODate[] {
  const lastMonday = mondayOf(addDays(anchor, -6))
  return Array.from({ length: count }, (_, i) => addDays(lastMonday, -7 * (count - 1 - i)))
}

export function resolvePeriod(key: PeriodKey, logs: LogCollections): Period {
  const end = anchorDate(logs)
  const lastMonday = mondayOf(end)
  let first: ISODate
  if (key === 'all') {
    // Charts start at the first harvest or weekly record; older plantings still count in totals.
    const activity = [...logs.harvests.map((h) => h.date), ...logs.weeklyInputs.map((w) => w.weekStart)]
    first = activity.length ? mondayOf(activity.reduce((a, b) => (b < a ? b : a))) : lastMonday
  } else {
    first = addDays(lastMonday, -7 * (PERIOD_WEEKS[key] - 1))
  }
  const weeks = mondaysBetween(first, lastMonday)
  return {
    key,
    start: key === 'all' ? null : first,
    end,
    weeks,
    completeWeeks: weeks.filter((m) => isComplete(m, end)),
  }
}

function inPeriod(date: ISODate, period: Pick<Period, 'start' | 'end'>): boolean {
  return (period.start === null || date >= period.start) && date <= period.end
}

/** Logs inside the period (weekly records by their Monday) and, optionally, one site. */
export function filterLogs(logs: LogCollections, period: Period, site: SiteFilter): LogCollections {
  const siteOk = (id: SiteId) => site === 'all' || id === site
  return {
    plantings: logs.plantings.filter((p) => siteOk(p.siteId) && inPeriod(p.date, period)),
    harvests: logs.harvests.filter((h) => siteOk(h.siteId) && inPeriod(h.date, period)),
    weeklyInputs: logs.weeklyInputs.filter((w) => siteOk(w.siteId) && inPeriod(w.weekStart, period)),
    failures: logs.failures.filter((f) => siteOk(f.siteId) && inPeriod(f.date, period)),
  }
}

/* ------------------------------------------------------------------ */
/* KPIs                                                                */
/* ------------------------------------------------------------------ */

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)
const ratio = (num: number, den: number): number | null => (den > 0 ? num / den : null)

export interface Kpis {
  totalKg: number
  compostedKg: number
  cropTypes: number
  waterLitres: number
  labourHours: number
  kgPerLabourHour: number | null
}

/** Expects logs already filtered by period and site. */
export function computeKpis(logs: LogCollections): Kpis {
  const totalKg = sum(logs.harvests.map((h) => h.weightKg))
  const labourHours = sum(logs.harvests.map((h) => h.labourHours)) + sum(logs.weeklyInputs.map((w) => w.labourHours))
  return {
    totalKg,
    compostedKg: sum(logs.harvests.filter((h) => h.destination === 'compost').map((h) => h.weightKg)),
    cropTypes: new Set([...logs.plantings.map((p) => p.cropId), ...logs.harvests.map((h) => h.cropId)]).size,
    waterLitres: sum(logs.weeklyInputs.map((w) => w.waterLitres)),
    labourHours,
    kgPerLabourHour: ratio(totalKg, labourHours),
  }
}

/* ------------------------------------------------------------------ */
/* Data completeness                                                   */
/* ------------------------------------------------------------------ */

export interface SiteCompleteness {
  siteId: SiteId
  logged: number
  expected: number
  score: number | null
  weeks: { weekStart: ISODate; logged: boolean }[]
}

export interface Completeness {
  logged: number
  expected: number
  /** 0–1, or null when there are no complete weeks */
  score: number | null
  bySite: SiteCompleteness[]
}

/** A site-week counts as logged when a weekly-inputs record exists for it. Score = logged ÷ (sites × weeks). */
export function computeCompleteness(
  weeklyInputs: WeeklyInputLog[],
  siteIds: SiteId[],
  weeks: ISODate[],
): Completeness {
  const logged = new Set(weeklyInputs.map((w) => `${w.siteId}|${w.weekStart}`))
  const bySite = siteIds.map((siteId) => {
    const siteWeeks = weeks.map((weekStart) => ({ weekStart, logged: logged.has(`${siteId}|${weekStart}`) }))
    const n = siteWeeks.filter((w) => w.logged).length
    return { siteId, logged: n, expected: weeks.length, score: ratio(n, weeks.length), weeks: siteWeeks }
  })
  const total = sum(bySite.map((s) => s.logged))
  const expected = siteIds.length * weeks.length
  return { logged: total, expected, score: ratio(total, expected), bySite }
}

/* ------------------------------------------------------------------ */
/* Time series and crop breakdown                                      */
/* ------------------------------------------------------------------ */

export interface WeekPoint {
  weekStart: ISODate
  harvestKg: number
  /** null = no weekly-inputs record for this week (not the same as 0 L) */
  waterLitres: number | null
  inProgress: boolean
}

/** Expects logs already filtered by period and site. */
export function weeklySeries(logs: LogCollections, period: Period): WeekPoint[] {
  return period.weeks.map((weekStart) => {
    const weekEnd = addDays(weekStart, 6)
    const water = logs.weeklyInputs.filter((w) => w.weekStart === weekStart)
    return {
      weekStart,
      harvestKg: sum(logs.harvests.filter((h) => h.date >= weekStart && h.date <= weekEnd).map((h) => h.weightKg)),
      waterLitres: water.length ? sum(water.map((w) => w.waterLitres)) : null,
      inProgress: !isComplete(weekStart, period.end),
    }
  })
}

export function harvestByCrop(logs: LogCollections): { cropId: CropId; kg: number }[] {
  const totals = new Map<CropId, number>()
  for (const h of logs.harvests) totals.set(h.cropId, (totals.get(h.cropId) ?? 0) + h.weightKg)
  return [...totals].map(([cropId, kg]) => ({ cropId, kg })).sort((a, b) => b.kg - a.kg)
}

/* ------------------------------------------------------------------ */
/* Allocating site inputs to crops                                     */
/* ------------------------------------------------------------------ */

export interface CropInputs {
  waterLitres: number
  compostKg: Record<CompostType, number>
  weeklyLabourHours: number
}

const emptyCompost = (): Record<CompostType, number> => ({
  vermicompost: 0,
  'food-waste-compost': 0,
  'leaf-mould': 0,
  none: 0,
})

/** Latest planting on each bed on or before `date`, from every planting ever logged. */
function bedCropsAt(site: Site, allPlantings: PlantingLog[], date: ISODate): CropId[] {
  return site.beds.flatMap((bed) => {
    let latest: PlantingLog | undefined
    for (const p of allPlantings) {
      if (p.bedId !== bed.id || p.date > date) continue
      if (!latest || isLater(p, latest)) latest = p
    }
    return latest ? [latest.cropId] : []
  })
}

/**
 * Water, compost and weekly labour are logged per site per week. Each site-week's inputs are
 * split across crops in proportion to the beds each crop occupies that week (a bed's crop is its
 * latest planting on or before the end of that week). Weeks with no planted beds stay unallocated.
 *
 * `weeklyInputs` should be period/site-filtered; `allPlantings` must be unfiltered so beds planted
 * before the period still count.
 */
export function allocateInputsToCrops(
  weeklyInputs: WeeklyInputLog[],
  allPlantings: PlantingLog[],
): { byCrop: Map<CropId, CropInputs>; unallocatedWaterLitres: number } {
  const byCrop = new Map<CropId, CropInputs>()
  let unallocatedWaterLitres = 0
  for (const w of weeklyInputs) {
    const site = siteById.get(w.siteId)
    const bedCrops = site ? bedCropsAt(site, allPlantings, addDays(w.weekStart, 6)) : []
    if (bedCrops.length === 0) {
      unallocatedWaterLitres += w.waterLitres
      continue
    }
    for (const cropId of bedCrops) {
      const share = 1 / bedCrops.length // one bed's share; crops with more beds get more shares
      const entry = byCrop.get(cropId) ?? { waterLitres: 0, compostKg: emptyCompost(), weeklyLabourHours: 0 }
      entry.waterLitres += w.waterLitres * share
      entry.compostKg[w.compostType] += w.compostKg * share
      entry.weeklyLabourHours += w.labourHours * share
      byCrop.set(cropId, entry)
    }
  }
  return { byCrop, unallocatedWaterLitres }
}

/* ------------------------------------------------------------------ */
/* Efficiency and cost by crop                                         */
/* ------------------------------------------------------------------ */

export interface CropEfficiency {
  cropId: CropId
  kg: number
  waterLitres: number
  labourHours: number
  kgPerLitre: number | null
  kgPerLabourHour: number | null
}

/** `logs` filtered by period and site; `allPlantings` unfiltered (for bed allocation). */
export function cropEfficiency(logs: LogCollections, allPlantings: PlantingLog[]): CropEfficiency[] {
  const { byCrop } = allocateInputsToCrops(logs.weeklyInputs, allPlantings)
  const cropIds = new Set<CropId>([...logs.harvests.map((h) => h.cropId), ...byCrop.keys()])
  return [...cropIds]
    .map((cropId) => {
      const harvests = logs.harvests.filter((h) => h.cropId === cropId)
      const kg = sum(harvests.map((h) => h.weightKg))
      const inputs = byCrop.get(cropId)
      const waterLitres = inputs?.waterLitres ?? 0
      const labourHours = sum(harvests.map((h) => h.labourHours)) + (inputs?.weeklyLabourHours ?? 0)
      return {
        cropId,
        kg,
        waterLitres,
        labourHours,
        kgPerLitre: ratio(kg, waterLitres),
        kgPerLabourHour: ratio(kg, labourHours),
      }
    })
    .sort((a, b) => (cropOrder.get(a.cropId) ?? 0) - (cropOrder.get(b.cropId) ?? 0))
}

export interface CropCost {
  cropId: CropId
  kg: number
  costs: { water: number; compost: number; propagation: number; labour: number }
  totalCost: number
  /** null when nothing was harvested */
  costPerKg: number | null
  importedPerKg: number | null
  localPerKg: number | null
  /** campus − supermarket; negative means growing on campus is cheaper */
  diffImported: number | null
  diffLocal: number | null
}

/**
 * Campus cost per kg = (allocated water × water price + allocated compost × compost price
 * + propagation units × unit cost + labour × labour rate) ÷ crop kg.
 */
export function cropCosts(
  logs: LogCollections,
  allPlantings: PlantingLog[],
  assumptions: CostAssumptions,
  prices: SupermarketPrice[],
): CropCost[] {
  const { byCrop } = allocateInputsToCrops(logs.weeklyInputs, allPlantings)
  const efficiency = cropEfficiency(logs, allPlantings)
  return efficiency.map(({ cropId, kg, labourHours }) => {
    const inputs = byCrop.get(cropId)
    const compost = inputs
      ? sum((Object.keys(inputs.compostKg) as CompostType[]).map((t) => inputs.compostKg[t] * assumptions.compostPerKg[t]))
      : 0
    const propagation = sum(
      logs.plantings
        .filter((p) => p.cropId === cropId)
        .map((p) => p.quantity * assumptions.propagationPerUnit[p.propagation]),
    )
    const costs = {
      water: (inputs?.waterLitres ?? 0) * assumptions.waterPerLitre,
      compost,
      propagation,
      labour: labourHours * assumptions.labourPerHour,
    }
    const totalCost = costs.water + costs.compost + costs.propagation + costs.labour
    const costPerKg = ratio(totalCost, kg)
    const price = prices.find((p) => p.cropId === cropId)
    const importedPerKg = price?.importedPerKg ?? null
    const localPerKg = price?.localPerKg ?? null
    return {
      cropId,
      kg,
      costs,
      totalCost,
      costPerKg,
      importedPerKg,
      localPerKg,
      diffImported: costPerKg !== null && importedPerKg !== null ? costPerKg - importedPerKg : null,
      diffLocal: costPerKg !== null && localPerKg !== null ? costPerKg - localPerKg : null,
    }
  })
}

/* ------------------------------------------------------------------ */
/* Survival, site comparison and leaderboard                           */
/* ------------------------------------------------------------------ */

/**
 * Survival = 1 − Σ estimated loss ÷ Σ planted quantity, for one site.
 * Losses: failures logged in the period. Plantings: those standing during the period — planted on
 * or before its end and not replaced on that bed before it started. For "all" that is every planting.
 * Returns null when nothing was planted.
 */
export function survivalRate(
  siteId: SiteId,
  allPlantings: PlantingLog[],
  failures: FailureLog[],
  period: Pick<Period, 'start' | 'end'>,
): number | null {
  const sitePlantings = allPlantings.filter((p) => p.siteId === siteId && p.date <= period.end)
  const standing = sitePlantings.filter((p) => {
    if (period.start === null) return true
    // The planting that replaced this one on its bed (the earliest later one), if any.
    const next = sitePlantings
      .filter((q) => q.bedId === p.bedId && isLater(q, p))
      .reduce<PlantingLog | undefined>((a, q) => (!a || isLater(a, q) ? q : a), undefined)
    return !next || next.date > period.start
  })
  const planted = sum(standing.map((p) => p.quantity))
  const lost = sum(failures.filter((f) => f.siteId === siteId && inPeriod(f.date, period)).map((f) => f.estimatedLossPlants))
  if (planted <= 0) return null
  return Math.min(1, Math.max(0, 1 - lost / planted))
}

export interface SiteRow {
  siteId: SiteId
  kg: number
  kgPerSqm: number
  waterLitres: number
  kgPerLitre: number | null
  labourHours: number
  completeness: number | null
  survival: number | null
}

/** All four sites side by side for one period (the site filter highlights, it doesn't hide). */
export function siteComparison(logs: LogCollections, period: Period): SiteRow[] {
  return sites.map((site) => {
    const own = filterLogs(logs, period, site.id)
    const kpis = computeKpis(own)
    return {
      siteId: site.id,
      kg: kpis.totalKg,
      kgPerSqm: kpis.totalKg / site.areaSqm,
      waterLitres: kpis.waterLitres,
      kgPerLitre: ratio(kpis.totalKg, kpis.waterLitres),
      labourHours: kpis.labourHours,
      completeness: computeCompleteness(own.weeklyInputs, [site.id], period.completeWeeks).score,
      survival: survivalRate(site.id, logs.plantings, logs.failures, period),
    }
  })
}

export type LeaderboardComponent = 'yield' | 'completeness' | 'survival' | 'waterEfficiency'

/** Equal weights by default. The committee can change these; they don't need to add up to 1. */
export const LEADERBOARD_WEIGHTS: Record<LeaderboardComponent, number> = {
  yield: 0.25,
  completeness: 0.25,
  survival: 0.25,
  waterEfficiency: 0.25,
}

export const LEADERBOARD_COMPONENTS: { key: LeaderboardComponent; label: string; unit: string }[] = [
  { key: 'yield', label: 'Yield per m²', unit: 'kg/m²' },
  { key: 'completeness', label: 'Data completeness', unit: '%' },
  { key: 'survival', label: 'Survival rate', unit: '%' },
  { key: 'waterEfficiency', label: 'Water efficiency', unit: 'kg/L' },
]

export interface LeaderboardEntry {
  rank: number
  siteId: SiteId
  /** 0–100 */
  score: number
  components: Record<LeaderboardComponent, { value: number | null; scaled: number }>
}

function componentValue(row: SiteRow, key: LeaderboardComponent): number | null {
  switch (key) {
    case 'yield':
      return row.kgPerSqm
    case 'completeness':
      return row.completeness
    case 'survival':
      return row.survival
    case 'waterEfficiency':
      return row.kgPerLitre
  }
}

/**
 * Blended score: each component is scaled 0–100 relative to the best site (value ÷ best × 100),
 * then weighted. A site with no data for a component scores 0 on it.
 */
export function leaderboard(
  rows: SiteRow[],
  weights: Record<LeaderboardComponent, number> = LEADERBOARD_WEIGHTS,
): LeaderboardEntry[] {
  const keys = LEADERBOARD_COMPONENTS.map((c) => c.key)
  const best = Object.fromEntries(
    keys.map((k) => [k, Math.max(0, ...rows.map((r) => componentValue(r, k) ?? 0))]),
  ) as Record<LeaderboardComponent, number>
  const weightTotal = sum(keys.map((k) => weights[k]))

  const entries = rows.map((row) => {
    const components = Object.fromEntries(
      keys.map((k) => {
        const value = componentValue(row, k)
        const scaled = value !== null && best[k] > 0 ? (value / best[k]) * 100 : 0
        return [k, { value, scaled }]
      }),
    ) as LeaderboardEntry['components']
    const score = weightTotal > 0 ? sum(keys.map((k) => components[k].scaled * weights[k])) / weightTotal : 0
    return { siteId: row.siteId, score, components }
  })
  return entries
    .sort((a, b) => b.score - a.score)
    .map((e, i, all) => ({ ...e, rank: i > 0 && Math.abs(all[i - 1].score - e.score) < 1e-9 ? i : i + 1 }))
}

/* ------------------------------------------------------------------ */
/* Sites: knowledge                                                    */
/* ------------------------------------------------------------------ */

export interface CropYield {
  cropId: CropId
  harvests: number
  /** Smallest and largest single harvest, in kg */
  minKg: number
  maxKg: number
  totalKg: number
}

/** Per-crop yield range at one site, from every harvest log for that site. */
export function cropYieldsAtSite(logs: Pick<LogCollections, 'harvests'>, siteId: SiteId): Map<CropId, CropYield> {
  const yields = new Map<CropId, CropYield>()
  for (const h of logs.harvests) {
    if (h.siteId !== siteId) continue
    const y = yields.get(h.cropId)
    if (!y) {
      yields.set(h.cropId, { cropId: h.cropId, harvests: 1, minKg: h.weightKg, maxKg: h.weightKg, totalKg: h.weightKg })
    } else {
      y.harvests += 1
      y.minKg = Math.min(y.minKg, h.weightKg)
      y.maxKg = Math.max(y.maxKg, h.weightKg)
      y.totalKg += h.weightKg
    }
  }
  return yields
}

/** Sorts crop ids into controlled-vocabulary order. */
export function sortCropIds(ids: Iterable<CropId>): CropId[] {
  return [...new Set(ids)].sort((a, b) => (cropOrder.get(a) ?? 0) - (cropOrder.get(b) ?? 0))
}
