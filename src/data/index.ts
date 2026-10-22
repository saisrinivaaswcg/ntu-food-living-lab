/**
 * Single entry point for all mock data.
 *
 * To switch to real data later, keep these export names and shapes and change
 * where they come from (e.g. fetch from an API or load a JSON export). Pages and
 * components only ever import from here — never from the individual files.
 */
import type { LogCollections } from '../types'
import { demoFailures } from './failures'
import { demoHallLogs } from './hallSites'
import { demoHarvests } from './harvests'
import { demoPlantings } from './plantings'
import { demoWeeklyInputs } from './weeklyInputs'

export { sites, CAMPUS_MAP_VIEW } from './sites'
export { AI_CREDIT, allImageSlots, emptyGalleryImage, illustrations, exploreHeroImage, exploreHeroVideo, learnImages, logImages, siteImage, siteImages } from './images'
export type { ImageSlot, PhotoCredit, VideoSlot } from './images'
export { hasIllustration, imageAsset, videoAsset } from './imageAssets'
export type { ImageAsset } from './imageAssets'
export { crops } from './crops'
export { cropNotes, problemLog } from './knowledge'
export { protocols } from './protocols'
export { handovers, HANDOVER_CHECKLIST_TEMPLATE } from './handovers'
export { supermarketPrices, costAssumptions, PRICE_SURVEY_DATE } from './prices'
export * from './vocabulary'
export { halls, NO_HALL, CAMPUS } from './halls'
export { demoTasks, demoClaims } from './tasks'
export { nparksResources } from './learnResources'
export { plantingWindows, GROW_ASSUMPTIONS } from './growMore'
export { bedSizes, starterItems, startSteps } from './startGarden'
export type { BedSize, StarterItem, StarterItemId } from './startGarden'
export { CUP_SEMESTER, spotlightChallenges, defaultSpotlights } from './competition'
export { demoCommunities, demoJoins, JOIN_PRIVACY_NOTE, pickPolicyOptions, WEEKDAY_NAMES } from './community'
export { DEMO_LOGIN_NOTICE, DEMO_COMMITTEE_PIN, DEMO_ADMIN_PIN, DEMO_COMMITTEE_SITE, DEMO_STUDENT, ADMIN_TEAM, contactMethodOptions } from './access'

/** All demo log records, grouped by form type. */
export const demoLogs: LogCollections = {
  plantings: [...demoPlantings, ...demoHallLogs.plantings],
  harvests: [...demoHarvests, ...demoHallLogs.harvests],
  weeklyInputs: [...demoWeeklyInputs, ...demoHallLogs.weeklyInputs],
  failures: [...demoFailures, ...demoHallLogs.failures],
}

/** Date range the demo logs cover (Monday of first week → last logged day). */
export const DEMO_DATA_PERIOD = { start: '2026-07-13', end: '2026-10-14' }
