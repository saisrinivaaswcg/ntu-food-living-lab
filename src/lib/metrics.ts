/**
 * Derived numbers, as pure functions over LogCollections.
 * Definitions live in docs/SPEC.md → Metric definitions.
 */
import { crops } from '../data'
import type {
  Bed,
  CompostType,
  CostAssumptions,
  CropId,
  FailureCause,
  FailureLog,
  HarvestDestination,
  HarvestLog,
  ISODate,
  LogCollections,
  PlantingLog,
  PropagationType,
  Site,
  SiteId,
  SupermarketPrice,
  WeeklyInputLog,
} from '../types'
import { addDays, daysBetween, mondayOf, todayISO } from './dates'
import { getSiteById, getSites } from './siteRegistry'

const cropOrder = new Map(crops.map((c, i) => [c.id, i]))
const cropById = new Map(crops.map((c) => [c.id, c]))

/** Plants a loss record takes away for good: lost minus any that recovered. */
export function netLoss(f: Pick<FailureLog, 'estimatedLossPlants' | 'recoveredPlants'>): number {
  return Math.max(0, f.estimatedLossPlants - (f.recoveredPlants ?? 0))
}

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
      .reduce((sum, f) => sum + netLoss(f), 0)
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
    // Site-setup records describe a bed's contents, not a planting event, so they stay out of period activity.
    plantings: logs.plantings.filter((p) => p.source !== 'setup' && siteOk(p.siteId) && inPeriod(p.date, period)),
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

/** The week with the highest value, or null when every week is empty. For chart captions. */
export function peakWeek(series: WeekPoint[], key: 'harvestKg' | 'waterLitres'): WeekPoint | null {
  let peak: WeekPoint | null = null
  for (const w of series) {
    const v = w[key]
    if (v !== null && v > 0 && (peak === null || v > (peak[key] ?? 0))) peak = w
  }
  return peak
}

/** Distinct sites with at least one harvest. Expects logs already filtered by period and site. */
export function sitesWithHarvests(logs: Pick<LogCollections, 'harvests'>): number {
  return new Set(logs.harvests.map((h) => h.siteId)).size
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
    const site = getSiteById(w.siteId)
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
 * Plantings that count towards survival in a period: planted on or before its end, and not replaced
 * on their bed by a later planting before it started.
 */
function standingPlantings(plantings: PlantingLog[], period: Pick<Period, 'start' | 'end'>): PlantingLog[] {
  const upToEnd = plantings.filter((p) => p.date <= period.end)
  return upToEnd.filter((p) => {
    if (period.start === null) return true
    // The planting that replaced this one on its bed (the earliest later one), if any.
    const next = upToEnd
      .filter((q) => q.siteId === p.siteId && q.bedId === p.bedId && isLater(q, p))
      .reduce<PlantingLog | undefined>((a, q) => (!a || isLater(a, q) ? q : a), undefined)
    return !next || next.date > period.start
  })
}

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
  const standing = standingPlantings(allPlantings.filter((p) => p.siteId === siteId), period)
  const planted = sum(standing.map((p) => p.quantity))
  const lost = sum(failures.filter((f) => f.siteId === siteId && inPeriod(f.date, period)).map(netLoss))
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
  return getSites().map((site) => {
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

/* ------------------------------------------------------------------ */
/* Harvest dashboard                                                   */
/* ------------------------------------------------------------------ */

export interface HarvestSummary {
  totalKg: number
  harvests: number
  /** Total kg ÷ growing area of the sites in scope */
  kgPerSqm: number | null
  topCrop: { cropId: CropId; kg: number } | null
}

/** Expects logs already filtered by period and site; `siteIds` are the sites in scope. */
export function harvestSummary(logs: Pick<LogCollections, 'harvests'>, siteIds: SiteId[]): HarvestSummary {
  const totalKg = sum(logs.harvests.map((h) => h.weightKg))
  const area = sum(siteIds.map((id) => getSiteById(id)?.areaSqm ?? 0))
  const top = harvestByCrop({ ...emptyLogs(), harvests: logs.harvests })[0]
  return { totalKg, harvests: logs.harvests.length, kgPerSqm: ratio(totalKg, area), topCrop: top ?? null }
}

export interface SiteWeeklyHarvest {
  siteId: SiteId
  totalKg: number
  points: { weekStart: ISODate; kg: number; inProgress: boolean }[]
}

/** Weekly kg for each site in scope, for small multiples. Expects logs already filtered by period and site. */
export function weeklyHarvestBySite(
  logs: Pick<LogCollections, 'harvests'>,
  period: Period,
  siteIds: SiteId[],
): SiteWeeklyHarvest[] {
  return siteIds.map((siteId) => {
    const own = logs.harvests.filter((h) => h.siteId === siteId)
    const points = period.weeks.map((weekStart) => {
      const weekEnd = addDays(weekStart, 6)
      return {
        weekStart,
        kg: sum(own.filter((h) => h.date >= weekStart && h.date <= weekEnd).map((h) => h.weightKg)),
        inProgress: !isComplete(weekStart, period.end),
      }
    })
    return { siteId, totalKg: sum(own.map((h) => h.weightKg)), points }
  })
}

/** Where the harvest went, every destination included, largest first. */
export function harvestByDestination(
  logs: Pick<LogCollections, 'harvests'>,
): { destination: HarvestDestination; kg: number; harvests: number }[] {
  const order: HarvestDestination[] = ['pantry', 'members', 'food-bank', 'compost']
  return order
    .map((destination) => {
      const own = logs.harvests.filter((h) => h.destination === destination)
      return { destination, kg: sum(own.map((h) => h.weightKg)), harvests: own.length }
    })
    .sort((a, b) => b.kg - a.kg)
}

/** Newest first: by date, then by when the record was created. */
export function newestFirst<T extends { date: ISODate; createdAt: string }>(records: T[]): T[] {
  return [...records].sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.createdAt < b.createdAt ? 1 : -1))
}

/** Harvests that carry a photo (an upload, or a demo placeholder), newest first. */
export function harvestsWithPhotos(logs: Pick<LogCollections, 'harvests'>): HarvestLog[] {
  return newestFirst(logs.harvests.filter((h) => h.photo !== undefined))
}

/* ------------------------------------------------------------------ */
/* Planting dashboard                                                  */
/* ------------------------------------------------------------------ */

export interface BedStatus {
  bed: Bed
  /** The planting growing in this bed now, or null when nothing is */
  planting: PlantingLog | null
  /** Planted quantity minus losses logged on this bed and crop since planting */
  plantsAlive: number
  daysSincePlanting: number | null
  /** First harvest of this planting, if there has been one */
  firstHarvest: ISODate | null
  /** Planting date + the crop's typical days to first harvest */
  expectedFirstHarvest: ISODate | null
  /** Days since planting ÷ typical days to first harvest, capped at 1 (1 once harvesting has started) */
  growthProgress: number
}

/** Bed-by-bed view of one site as of the anchor date. Uses all logs (not period-filtered). */
export function bedStatuses(
  logs: Pick<LogCollections, 'plantings' | 'failures' | 'harvests'>,
  site: Site,
  anchor: ISODate,
): BedStatus[] {
  const current = currentPlantingByBed(logs, site)
  return site.beds.map((bed) => {
    const planting = current.get(bed.id) ?? null
    if (!planting) {
      return {
        bed,
        planting,
        plantsAlive: 0,
        daysSincePlanting: null,
        firstHarvest: null,
        expectedFirstHarvest: null,
        growthProgress: 0,
      }
    }
    const lost = sum(
      logs.failures
        .filter((f) => f.bedId === bed.id && f.cropId === planting.cropId && f.date >= planting.date)
        .map(netLoss),
    )
    const harvests = logs.harvests
      .filter((h) => h.bedId === bed.id && h.cropId === planting.cropId && h.date >= planting.date)
      .map((h) => h.date)
      .sort()
    const typical = cropById.get(planting.cropId)?.daysToFirstHarvest
    const daysSincePlanting = Math.max(0, daysBetween(planting.date, anchor))
    const firstHarvest = harvests[0] ?? null
    return {
      bed,
      planting,
      plantsAlive: Math.max(0, planting.quantity - lost),
      daysSincePlanting,
      firstHarvest,
      expectedFirstHarvest: typical === undefined ? null : addDays(planting.date, typical),
      growthProgress: firstHarvest ? 1 : typical ? Math.min(1, daysSincePlanting / typical) : 0,
    }
  })
}

export interface PlantingSummary {
  plantsInGround: number
  plantingsInPeriod: number
  /** Across the sites in scope; null when nothing was planted */
  survival: number | null
  bedsInUse: number
  totalBeds: number
}

/**
 * `allLogs`: every log (for what is in the ground now); `filtered`: logs already filtered by period and
 * site (for plantings in the period); survival uses the same rule as the site comparison.
 */
export function plantingSummary(
  allLogs: LogCollections,
  filtered: Pick<LogCollections, 'plantings'>,
  siteIds: SiteId[],
  period: Period,
): PlantingSummary {
  const scopeSites = siteIds.flatMap((id) => getSiteById(id) ?? [])
  const beds = scopeSites.flatMap((site) => bedStatuses(allLogs, site, period.end))
  const counts = survivalCounts(
    allLogs.plantings.filter((p) => siteIds.includes(p.siteId)),
    allLogs.failures.filter((f) => siteIds.includes(f.siteId)),
    period,
  )
  return {
    plantsInGround: sum(beds.map((b) => b.plantsAlive)),
    plantingsInPeriod: filtered.plantings.length,
    survival: counts.planted > 0 ? Math.min(1, Math.max(0, 1 - counts.lost / counts.planted)) : null,
    bedsInUse: beds.filter((b) => b.planting !== null).length,
    totalBeds: beds.length,
  }
}

/** Planted and lost plant counts behind a survival rate (same rule as survivalRate). */
function survivalCounts(
  plantings: PlantingLog[],
  failures: FailureLog[],
  period: Pick<Period, 'start' | 'end'>,
): { planted: number; lost: number } {
  return {
    planted: sum(standingPlantings(plantings, period).map((p) => p.quantity)),
    lost: sum(failures.filter((f) => inPeriod(f.date, period)).map(netLoss)),
  }
}

/** Plantings and plants put in each week. Expects logs already filtered by period and site. */
export function weeklyPlantings(
  logs: Pick<LogCollections, 'plantings'>,
  period: Period,
): { weekStart: ISODate; plantings: number; plants: number; inProgress: boolean }[] {
  return period.weeks.map((weekStart) => {
    const weekEnd = addDays(weekStart, 6)
    const own = logs.plantings.filter((p) => p.date >= weekStart && p.date <= weekEnd)
    return {
      weekStart,
      plantings: own.length,
      plants: sum(own.map((p) => p.quantity)),
      inProgress: !isComplete(weekStart, period.end),
    }
  })
}

export interface CropSurvival {
  cropId: CropId
  planted: number
  lost: number
  survival: number | null
}

/** Survival by crop for the sites in scope, using the same rule as the per-site survival rate. */
export function survivalByCrop(allLogs: LogCollections, siteIds: SiteId[], period: Period): CropSurvival[] {
  const plantings = allLogs.plantings.filter((p) => siteIds.includes(p.siteId))
  const failures = allLogs.failures.filter((f) => siteIds.includes(f.siteId))
  return crops
    .map((crop) => {
      const c = survivalCounts(
        plantings.filter((p) => p.cropId === crop.id),
        failures.filter((f) => f.cropId === crop.id),
        period,
      )
      return {
        cropId: crop.id,
        ...c,
        survival: c.planted > 0 ? Math.min(1, Math.max(0, 1 - c.lost / c.planted)) : null,
      }
    })
    .filter((c) => c.planted > 0)
    .sort((a, b) => (a.survival ?? 0) - (b.survival ?? 0))
}

/** How plantings were propagated. Expects logs already filtered by period and site. */
export function propagationBreakdown(
  logs: Pick<LogCollections, 'plantings'>,
): { propagation: PropagationType; plantings: number; plants: number }[] {
  const order: PropagationType[] = ['seed', 'cutting', 'seedling']
  return order
    .map((propagation) => {
      const own = logs.plantings.filter((p) => p.propagation === propagation)
      return { propagation, plantings: own.length, plants: sum(own.map((p) => p.quantity)) }
    })
    .sort((a, b) => b.plants - a.plants)
}

export interface CropDaysToHarvest {
  cropId: CropId
  /** Median days from planting to first harvest, across plantings in scope */
  medianDays: number
  plantings: number
  /** The crop's typical days in Singapore conditions, for comparison */
  typicalDays: number
}

/**
 * Days from planting to first harvest, by crop. Counts plantings at the sites in scope whose first
 * harvest (same bed and crop, before the bed was replanted) falls inside the period.
 */
export function daysToFirstHarvestByCrop(allLogs: LogCollections, siteIds: SiteId[], period: Period): CropDaysToHarvest[] {
  const plantings = allLogs.plantings.filter((p) => siteIds.includes(p.siteId))
  const days = new Map<CropId, number[]>()
  for (const p of plantings) {
    const next = plantings
      .filter((q) => q.bedId === p.bedId && isLater(q, p))
      .reduce<PlantingLog | undefined>((a, q) => (!a || isLater(a, q) ? q : a), undefined)
    const first = allLogs.harvests
      .filter((h) => h.bedId === p.bedId && h.cropId === p.cropId && h.date >= p.date && (!next || h.date < next.date))
      .map((h) => h.date)
      .sort()[0]
    if (!first || !inPeriod(first, period)) continue
    days.set(p.cropId, [...(days.get(p.cropId) ?? []), daysBetween(p.date, first)])
  }
  return [...days.entries()]
    .map(([cropId, list]) => ({
      cropId,
      medianDays: median(list),
      plantings: list.length,
      typicalDays: cropById.get(cropId)?.daysToFirstHarvest ?? 0,
    }))
    .sort((a, b) => a.medianDays - b.medianDays)
}

export interface UpcomingHarvest {
  siteId: SiteId
  bed: Bed
  planting: PlantingLog
  expected: ISODate
  /** Negative when the expected date has passed */
  daysAway: number
}

/** Beds growing now that have not been harvested yet, by expected first harvest (soonest first). */
export function upcomingHarvests(allLogs: LogCollections, siteIds: SiteId[], anchor: ISODate): UpcomingHarvest[] {
  return siteIds
    .flatMap((id) => {
      const site = getSiteById(id)
      if (!site) return []
      return bedStatuses(allLogs, site, anchor).flatMap((b) =>
        b.planting && !b.firstHarvest && b.expectedFirstHarvest
          ? [
              {
                siteId: id,
                bed: b.bed,
                planting: b.planting,
                expected: b.expectedFirstHarvest,
                daysAway: daysBetween(anchor, b.expectedFirstHarvest),
              },
            ]
          : [],
      )
    })
    .sort((a, b) => a.expected.localeCompare(b.expected))
}

/** Plants lost by cause, every cause included, largest first. Expects logs already filtered by period and site. */
export function lossesByCause(
  logs: Pick<LogCollections, 'failures'>,
): { cause: FailureCause; plants: number; events: number }[] {
  const order: FailureCause[] = ['pest', 'disease', 'drought', 'unknown']
  return order
    .map((cause) => {
      const own = logs.failures.filter((f) => f.cause === cause)
      return { cause, plants: sum(own.map(netLoss)), events: own.length }
    })
    .sort((a, b) => b.plants - a.plants)
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const emptyLogs = (): LogCollections => ({ plantings: [], harvests: [], weeklyInputs: [], failures: [] })

/** Plants alive in one bed now (its current planting minus net losses), or null when nothing is growing. */
export function plantsAliveInBed(
  logs: Pick<LogCollections, 'plantings' | 'failures' | 'harvests'>,
  site: Site,
  bedId: string,
): number | null {
  const status = bedStatuses(logs, site, latestLogDate({ ...emptyLogs(), ...logs }) ?? todayISO()).find(
    (b) => b.bed.id === bedId,
  )
  return status?.planting ? status.plantsAlive : null
}

/* ------------------------------------------------------------------ */
/* Growth (timelines, bed map, Log page)                               */
/* ------------------------------------------------------------------ */

export type GrowthStage = 'seedling' | 'growing' | 'ready' | 'harvesting'

export const GROWTH_STAGES: { stage: GrowthStage; label: string; from: number }[] = [
  { stage: 'seedling', label: 'Seedling', from: 0 },
  { stage: 'growing', label: 'Growing', from: 0.25 },
  { stage: 'ready', label: 'Ready', from: 0.9 },
  { stage: 'harvesting', label: 'Harvesting', from: 1 },
]

/** Days before the expected first harvest when a bed counts as ready. */
const READY_WINDOW_DAYS = 7

/**
 * "Today" for growth: the real date while logs are recent (within 30 days), otherwise the latest log,
 * so demo data still reads sensibly long after it was made.
 */
export function growthAsOf(logs: LogCollections, today: ISODate = todayISO()): ISODate {
  const latest = latestLogDate(logs)
  if (!latest) return today
  return daysBetween(latest, today) > 30 ? latest : today > latest ? today : latest
}

/** Stage of a bed's current planting; null when nothing is growing. */
export function growthStage(status: BedStatus, asOf: ISODate): GrowthStage | null {
  if (!status.planting) return null
  if (status.firstHarvest) return 'harvesting'
  if (status.expectedFirstHarvest && daysBetween(asOf, status.expectedFirstHarvest) <= READY_WINDOW_DAYS) return 'ready'
  return status.growthProgress >= 0.9 ? 'ready' : status.growthProgress >= 0.25 ? 'growing' : 'seedling'
}

export interface GrowthTimeline {
  siteId: SiteId
  status: BedStatus
  stage: GrowthStage
  /** Days since planting ÷ typical days to first harvest (can pass 1 when late) */
  progress: number
  /** Days until the expected first harvest; negative when it has passed */
  daysToExpected: number | null
  lastHarvest: ISODate | null
}

/** One timeline per bed that is growing something, at the sites in scope, soonest harvest first. */
export function growthTimelines(logs: LogCollections, siteIds: SiteId[], asOf: ISODate): GrowthTimeline[] {
  return siteIds
    .flatMap((siteId) => {
      const site = getSiteById(siteId)
      if (!site) return []
      return bedStatuses(logs, site, asOf).flatMap((status): GrowthTimeline[] => {
        const stage = growthStage(status, asOf)
        if (!stage || !status.planting) return []
        const typical = cropById.get(status.planting.cropId)?.daysToFirstHarvest ?? 0
        const lastHarvest =
          logs.harvests
            .filter((h) => h.bedId === status.bed.id && h.cropId === status.planting!.cropId && h.date >= status.planting!.date)
            .map((h) => h.date)
            .sort()
            .at(-1) ?? null
        return [
          {
            siteId,
            status,
            stage,
            progress: typical > 0 ? (status.daysSincePlanting ?? 0) / typical : 0,
            daysToExpected: status.expectedFirstHarvest ? daysBetween(asOf, status.expectedFirstHarvest) : null,
            lastHarvest,
          },
        ]
      })
    })
    .sort((a, b) => (a.daysToExpected ?? 9999) - (b.daysToExpected ?? 9999))
}

export interface LogOverview {
  /** Beds with a planting growing now */
  growing: number
  /** Beds not yet harvested whose first harvest is due within a week (or overdue) */
  readyThisWeek: number
  /** Days since the latest harvest, or null when none */
  lastHarvestDaysAgo: number | null
}

export function logOverview(logs: LogCollections, siteIds: SiteId[], asOf: ISODate): LogOverview {
  const timelines = growthTimelines(logs, siteIds, asOf)
  const latestHarvest = logs.harvests.map((h) => h.date).sort().at(-1)
  return {
    growing: timelines.length,
    readyThisWeek: timelines.filter((t) => t.stage === 'ready').length,
    lastHarvestDaysAgo: latestHarvest ? Math.max(0, daysBetween(latestHarvest, asOf)) : null,
  }
}

/**
 * Beds worth harvesting soon, for the Log page: first harvests due within two weeks (or overdue), then
 * beds already cropping, longest since their last harvest first.
 */
export function readySoon(logs: LogCollections, siteIds: SiteId[], asOf: ISODate, limit = 8): GrowthTimeline[] {
  const timelines = growthTimelines(logs, siteIds, asOf)
  const due = timelines.filter((t) => t.stage !== 'harvesting' && t.daysToExpected !== null && t.daysToExpected <= 14)
  const cropping = timelines
    .filter((t) => t.stage === 'harvesting')
    .sort((a, b) => (a.lastHarvest ?? '').localeCompare(b.lastHarvest ?? ''))
  return [...due, ...cropping].slice(0, limit)
}

export interface BedHistory {
  /** Newest first (site-setup records included, as "set by hand") */
  plantings: PlantingLog[]
  /** Newest first */
  losses: FailureLog[]
  harvests: number
  harvestKg: number
  /** Losses in the 14 days up to asOf */
  recentLoss: boolean
}

/** What has happened in one bed, for the bed map's detail view. */
export function bedHistory(logs: LogCollections, bedId: string, asOf: ISODate): BedHistory {
  const harvests = logs.harvests.filter((h) => h.bedId === bedId)
  const losses = newestFirst(logs.failures.filter((f) => f.bedId === bedId))
  return {
    plantings: newestFirst(logs.plantings.filter((p) => p.bedId === bedId)),
    losses,
    harvests: harvests.length,
    harvestKg: sum(harvests.map((h) => h.weightKg)),
    recentLoss: losses.some((f) => f.date <= asOf && daysBetween(f.date, asOf) <= 14 && netLoss(f) > 0),
  }
}
