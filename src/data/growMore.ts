import type { CropId } from '../types'

/**
 * When to plant each built-in crop in Singapore's climate, by month (1 = January).
 * 'good': plant now; 'caution': it works with care (see note). Months not listed are fine.
 * DEMONSTRATION GUIDANCE drawn from the care guides' climate notes; adjust with your own logs.
 * Crops added on a device get no windows: the calendar shows them as "fine, check the guide".
 */
export const plantingWindows: Record<CropId, { good: number[]; caution: number[]; note: string }> = {
  basil: { good: [2, 3, 4, 5, 6, 7, 8, 9], caution: [11, 12, 1], note: 'Monsoon rain splashes soil onto leaves: mulch and raise pots.' },
  mint: { good: [5, 6, 7, 8, 9, 10, 11], caution: [2, 3, 4], note: 'Hot dry spells scorch it in planters: give it afternoon shade.' },
  lemongrass: { good: [3, 4, 5, 6, 7, 8, 9], caution: [12, 1], note: 'Slow to establish in waterlogged monsoon soil.' },
  pandan: { good: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], caution: [], note: 'Plant any month; it likes the wet season best.' },
  'chilli-padi': { good: [2, 3, 4, 5, 6, 7, 8], caution: [11, 12, 1], note: 'Wet months bring fruit rot and anthracnose.' },
  turmeric: { good: [3, 4, 5], caution: [10, 11, 12, 1], note: 'Plant before mid-year so rhizomes swell over eight months.' },
  kangkong: { good: [4, 5, 6, 7, 8, 9, 10, 11, 12, 1], caution: [2, 3], note: 'Needs constant water: avoid the driest weeks unless the bed wicks.' },
}

/** Assumptions for the expansion planner. Indicative, demo. */
export const GROW_ASSUMPTIONS = {
  /** A season, in weeks: the period NTU's harvest-per-plant figures cover */
  seasonWeeks: 13,
  /** kg of compost to prepare each m² of new bed */
  compostKgPerSqm: 5,
  /** Cost of new planter space per m² when spare space runs out (a S$65 planter holds about 1.5 m²) */
  newBedPerSqm: 43,
  /** Litres of water per m² per week when a site has no water logs */
  defaultWaterPerSqmWeek: 25,
}
