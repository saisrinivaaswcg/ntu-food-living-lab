/**
 * Single entry point for all mock data.
 *
 * To switch to real data later, keep these export names and shapes and change
 * where they come from (e.g. fetch from an API or load a JSON export). Pages and
 * components only ever import from here — never from the individual files.
 */
import type { LogCollections } from '../types'
import { demoFailures } from './failures'
import { demoHarvests } from './harvests'
import { demoPlantings } from './plantings'
import { demoWeeklyInputs } from './weeklyInputs'

export { sites, CAMPUS_MAP_VIEW } from './sites'
export { allImageSlots, emptyGalleryImage, exploreHeroImage, exploreHeroVideo, logImages, siteImages } from './images'
export type { ImageSlot, PhotoCredit, VideoSlot } from './images'
export { imageAsset, videoAsset } from './imageAssets'
export type { ImageAsset } from './imageAssets'
export { crops } from './crops'
export { cropNotes, problemLog } from './knowledge'
export { protocols } from './protocols'
export { handovers, HANDOVER_CHECKLIST_TEMPLATE } from './handovers'
export { supermarketPrices, costAssumptions, PRICE_SURVEY_DATE } from './prices'
export * from './vocabulary'

/** All demo log records, grouped by form type. */
export const demoLogs: LogCollections = {
  plantings: demoPlantings,
  harvests: demoHarvests,
  weeklyInputs: demoWeeklyInputs,
  failures: demoFailures,
}

/** Date range the demo logs cover (Monday of first week → last logged day). */
export const DEMO_DATA_PERIOD = { start: '2026-07-13', end: '2026-10-14' }
