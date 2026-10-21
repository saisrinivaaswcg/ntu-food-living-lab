import type { CompostType, CropId, FailureLog, HarvestDestination, HarvestLog, ISODate, PlantingLog, PropagationType, Site, WeeklyInputLog } from '../types'

/**
 * DEMONSTRATION DATA: three INVENTED hall gardens, so the Hall Garden Cup has teams to rank. They are
 * not real NTU gardens (the halls are real, the gardens and pins are made up) and the UI labels every
 * one "Demo hall site". Their logs are generated from a fixed seed, so they are the same on every load.
 */

export const demoHallSites: Site[] = [
  {
    id: 'crescent-hall-rooftop',
    name: 'Crescent Hall Rooftop Planters',
    shortName: 'Crescent Hall',
    description: 'A small rooftop of self-watering planters run by Crescent Hall residents. Basil, kangkong and chilli for hall suppers.',
    coordinates: [1.34878, 103.68862],
    locationNote: 'Crescent Hall, roof terrace (demo pin)',
    status: 'active',
    statusNote: 'All three planters producing. Kangkong on its third cut.',
    managedBy: 'Crescent Hall Garden Crew (demo)',
    hall: 'Crescent Hall',
    fictional: true,
    established: '2026-02-02',
    areaSqm: 10,
    beds: [
      { id: 'CRH-B1', label: 'Planter 1 (basil)', areaSqm: 3.5 },
      { id: 'CRH-B2', label: 'Planter 2 (kangkong)', areaSqm: 3.5 },
      { id: 'CRH-B3', label: 'Planter 3 (chilli)', areaSqm: 3 },
    ],
    photoAlt: 'Self-watering planters of herbs on a hall roof terrace (illustration placeholder)',
  },
  {
    id: 'tamarind-hall-garden',
    name: 'Tamarind Hall Kitchen Garden',
    shortName: 'Tamarind Hall',
    description: 'In-ground beds beside the hall pantry, with a big volunteer roster and a weekly cook-up of whatever is ready.',
    coordinates: [1.35478, 103.68733],
    locationNote: 'Tamarind Hall, beside the pantry (demo pin)',
    status: 'active',
    statusNote: 'Five beds in use. Lemongrass and pandan well established.',
    managedBy: 'Tamarind Hall Green Team (demo)',
    hall: 'Tamarind Hall',
    fictional: true,
    established: '2025-09-01',
    areaSqm: 30,
    beds: [
      { id: 'TMH-B1', label: 'Bed 1 (sun)', areaSqm: 6 },
      { id: 'TMH-B2', label: 'Bed 2 (sun)', areaSqm: 6 },
      { id: 'TMH-B3', label: 'Bed 3 (part shade)', areaSqm: 6 },
      { id: 'TMH-B4', label: 'Bed 4 (part shade)', areaSqm: 6 },
      { id: 'TMH-B5', label: 'Bed 5 (herb spiral)', areaSqm: 6 },
    ],
    photoAlt: 'In-ground kitchen garden beds beside a hall building (illustration placeholder)',
  },
  {
    id: 'hall-2-corridor',
    name: 'Hall 2 Corridor Herbs',
    shortName: 'Hall 2',
    description: 'Two long troughs along a sheltered corridor. A new team, still finding a watering rhythm.',
    coordinates: [1.34935, 103.68535],
    locationNote: 'Hall 2, ground-floor corridor (demo pin)',
    status: 'needs-attention',
    statusNote: 'Lemongrass trough recovering after a dry spell.',
    managedBy: 'Hall 2 Herb Club (demo)',
    hall: 'Hall 2',
    fictional: true,
    established: '2026-05-04',
    areaSqm: 8,
    beds: [
      { id: 'H2-T1', label: 'Trough 1 (mint)', areaSqm: 4 },
      { id: 'H2-T2', label: 'Trough 2 (lemongrass)', areaSqm: 4 },
    ],
    photoAlt: 'Long herb troughs along a sheltered hall corridor (illustration placeholder)',
  },
]

/* ------------------------------------------------------------------ */
/* Generated demo logs                                                 */
/* ------------------------------------------------------------------ */

/** Small seeded random generator (mulberry32): same numbers every load. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pad = (n: number) => String(n).padStart(2, '0')
function addDays(iso: ISODate, days: number): ISODate {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

interface BedPlan {
  bedId: string
  cropId: CropId
  planted: ISODate
  quantity: number
  propagation: PropagationType
  /** First harvest date, then every `every` days until the end of the demo period */
  firstHarvest: ISODate
  every: number
  kg: [number, number]
}

interface HallPlan {
  siteId: string
  prefix: string
  seed: number
  beds: BedPlan[]
  /** Weekly water (L) range and compost */
  water: [number, number]
  compost: { type: CompostType; kg: [number, number] }
  labour: [number, number]
  /** Week numbers (0 = 13 Jul) with no weekly record */
  missedWeeks: number[]
  failures: Omit<FailureLog, 'id' | 'siteId' | 'source' | 'createdAt'>[]
}

const DEMO_END: ISODate = '2026-10-14'
const FIRST_MONDAY: ISODate = '2026-07-13'
const WEEKS = 14

const plans: HallPlan[] = [
  {
    siteId: 'crescent-hall-rooftop',
    prefix: 'crh',
    seed: 11,
    beds: [
      { bedId: 'CRH-B1', cropId: 'basil', planted: '2026-06-01', quantity: 18, propagation: 'seed', firstHarvest: '2026-07-18', every: 7, kg: [0.18, 0.32] },
      { bedId: 'CRH-B2', cropId: 'kangkong', planted: '2026-07-06', quantity: 60, propagation: 'seed', firstHarvest: '2026-08-04', every: 10, kg: [0.3, 0.55] },
      { bedId: 'CRH-B3', cropId: 'chilli-padi', planted: '2026-05-11', quantity: 8, propagation: 'seedling', firstHarvest: '2026-08-06', every: 14, kg: [0.08, 0.16] },
    ],
    water: [120, 160],
    compost: { type: 'vermicompost', kg: [1, 2.5] },
    labour: [2, 3.5],
    missedWeeks: [4, 8, 10],
    failures: [
      { bedId: 'CRH-B1', cropId: 'basil', date: '2026-09-05', cause: 'pest', estimatedLossPlants: 2, plantsInBed: 18, recoveredPlants: 1, description: 'Aphids on two plants; one bounced back after a soap spray.' },
    ],
  },
  {
    siteId: 'tamarind-hall-garden',
    prefix: 'tmh',
    seed: 23,
    beds: [
      { bedId: 'TMH-B1', cropId: 'lemongrass', planted: '2026-03-02', quantity: 24, propagation: 'cutting', firstHarvest: '2026-07-20', every: 14, kg: [0.9, 1.5] },
      { bedId: 'TMH-B2', cropId: 'basil', planted: '2026-06-08', quantity: 40, propagation: 'seed', firstHarvest: '2026-07-25', every: 7, kg: [0.25, 0.45] },
      { bedId: 'TMH-B3', cropId: 'pandan', planted: '2026-02-16', quantity: 12, propagation: 'cutting', firstHarvest: '2026-07-22', every: 14, kg: [0.3, 0.55] },
      { bedId: 'TMH-B4', cropId: 'mint', planted: '2026-05-18', quantity: 30, propagation: 'cutting', firstHarvest: '2026-07-16', every: 7, kg: [0.2, 0.38] },
      { bedId: 'TMH-B5', cropId: 'chilli-padi', planted: '2026-05-25', quantity: 14, propagation: 'seedling', firstHarvest: '2026-08-20', every: 14, kg: [0.1, 0.2] },
    ],
    water: [280, 380],
    compost: { type: 'food-waste-compost', kg: [6, 10] },
    labour: [7, 11],
    missedWeeks: [6],
    failures: [
      { bedId: 'TMH-B4', cropId: 'mint', date: '2026-08-19', cause: 'disease', estimatedLossPlants: 4, plantsInBed: 30, description: 'Rust spots on four clumps in the wet week; cut out and binned.' },
      { bedId: 'TMH-B2', cropId: 'basil', date: '2026-09-23', cause: 'pest', estimatedLossPlants: 5, plantsInBed: 40, recoveredPlants: 2, description: 'Caterpillars on the outer row. Two plants regrew from the base.' },
    ],
  },
  {
    siteId: 'hall-2-corridor',
    prefix: 'h2',
    seed: 37,
    beds: [
      { bedId: 'H2-T1', cropId: 'mint', planted: '2026-05-11', quantity: 16, propagation: 'cutting', firstHarvest: '2026-07-21', every: 10, kg: [0.12, 0.26] },
      { bedId: 'H2-T2', cropId: 'lemongrass', planted: '2026-05-04', quantity: 12, propagation: 'cutting', firstHarvest: '2026-08-25', every: 21, kg: [0.4, 0.7] },
    ],
    water: [70, 110],
    compost: { type: 'leaf-mould', kg: [0.5, 1.5] },
    labour: [1, 2.5],
    missedWeeks: [1, 2, 5, 7, 8, 11],
    failures: [
      { bedId: 'H2-T2', cropId: 'lemongrass', date: '2026-08-11', cause: 'drought', estimatedLossPlants: 4, plantsInBed: 12, description: 'Trough dried out over a long weekend with nobody on the roster.' },
    ],
  },
]

const DESTINATIONS: HarvestDestination[] = ['pantry', 'members', 'pantry', 'food-bank', 'members']
const CROP_LABEL: Record<string, string> = {
  basil: 'Thai basil',
  mint: 'Mint',
  lemongrass: 'Lemongrass',
  pandan: 'Pandan',
  'chilli-padi': 'Chilli padi',
  turmeric: 'Turmeric',
  kangkong: 'Kangkong',
}

function build() {
  const plantings: PlantingLog[] = []
  const harvests: HarvestLog[] = []
  const weeklyInputs: WeeklyInputLog[] = []
  const failures: FailureLog[] = []
  for (const plan of plans) {
    const rand = seeded(plan.seed)
    const between = ([lo, hi]: [number, number], step = 0.05) => Math.round((lo + rand() * (hi - lo)) / step) * step
    plan.beds.forEach((b, i) => {
      plantings.push({
        id: `demo-${plan.prefix}-p-${i + 1}`,
        siteId: plan.siteId,
        bedId: b.bedId,
        cropId: b.cropId,
        date: b.planted,
        quantity: b.quantity,
        propagation: b.propagation,
        source: 'demo',
        createdAt: `${b.planted}T18:30:00+08:00`,
      })
      let n = 0
      for (let d = b.firstHarvest; d <= DEMO_END; d = addDays(d, b.every + Math.round(rand() * 2) - 1)) {
        n++
        harvests.push({
          id: `demo-${plan.prefix}-h-${i + 1}-${n}`,
          siteId: plan.siteId,
          bedId: b.bedId,
          cropId: b.cropId,
          date: d,
          weightKg: Number(between(b.kg, 0.01).toFixed(2)),
          destination: DESTINATIONS[Math.floor(rand() * DESTINATIONS.length)],
          labourHours: between([0.25, 0.75], 0.25),
          photo: { kind: 'demo-placeholder', caption: `${CROP_LABEL[b.cropId] ?? b.cropId}, ${b.bedId} — demo photo` },
          source: 'demo',
          createdAt: `${d}T09:00:00+08:00`,
        })
      }
    })
    for (let w = 0; w < WEEKS; w++) {
      if (plan.missedWeeks.includes(w)) continue
      const weekStart = addDays(FIRST_MONDAY, w * 7)
      weeklyInputs.push({
        id: `demo-${plan.prefix}-w-${w + 1}`,
        siteId: plan.siteId,
        weekStart,
        waterLitres: Math.round(between(plan.water, 5)),
        compostType: plan.compost.type,
        compostKg: Number(between(plan.compost.kg, 0.5).toFixed(1)),
        labourHours: Number(between(plan.labour, 0.5).toFixed(1)),
        source: 'demo',
        createdAt: `${addDays(weekStart, 6)}T20:30:00+08:00`,
      })
    }
    plan.failures.forEach((f, i) =>
      failures.push({ ...f, id: `demo-${plan.prefix}-f-${i + 1}`, siteId: plan.siteId, source: 'demo', createdAt: `${f.date}T19:30:00+08:00` }),
    )
  }
  return { plantings, harvests, weeklyInputs, failures }
}

export const demoHallLogs = build()
