import type { CupSemester, SpotlightChallenge, SpotlightId } from '../types'

/**
 * Hall Garden Cup settings. Halls compete as teams: nothing here ranks individual people.
 * The score weights live with the scoring in src/lib/metrics.ts (HALL_CUP_WEIGHTS).
 */

export const CUP_SEMESTER: CupSemester = {
  label: 'Semester 1, AY2026/27',
  start: '2026-08-10',
  end: '2026-12-05',
}

/** The fixed list Admin chooses each month's spotlight from. */
export const spotlightChallenges: SpotlightChallenge[] = [
  { id: 'steady-logger', title: 'Steady loggers', pitch: 'Log weekly inputs every week of the month.', measure: 'Weeks with a weekly-inputs record ÷ weeks in the month', unit: '%' },
  { id: 'water-wise', title: 'Water-wise month', pitch: 'Grow more with less: mulch, water at dawn, fix leaks.', measure: 'kg harvested per litre of water', unit: 'kg/L' },
  { id: 'compost-champion', title: 'Compost champions', pitch: 'Close the loop: feed beds with compost, including canteen food waste.', measure: 'kg of compost added per m²', unit: 'kg/m²' },
  { id: 'share-the-harvest', title: 'Share the harvest', pitch: 'Send produce to the pantry and the food bank.', measure: 'Share of harvest kg sent to the pantry or food bank', unit: '%' },
  { id: 'welcome-wagon', title: 'Welcome wagon', pitch: 'Bring new people in: workdays, tours and beginner tasks.', measure: 'People who asked to join, per m²', unit: 'per m²' },
  { id: 'new-plantings', title: 'Plant it forward', pitch: 'Fill empty beds before the rains.', measure: 'Plants put in the ground per m²', unit: 'per m²' },
]

/** Demo spotlights, as if Admin had chosen them. Months are "YYYY-MM". */
export const defaultSpotlights: Record<string, SpotlightId> = {
  '2026-08': 'steady-logger',
  '2026-09': 'water-wise',
  '2026-10': 'share-the-harvest',
}
