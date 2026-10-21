/**
 * Domain model for the NTU Campus Food Systems Living Lab.
 *
 * Every site logs into the SAME shapes below. That is the whole point of the
 * platform: identical fields + controlled vocabularies = data that can be
 * compared across sites and survives committee turnover.
 */

/* ------------------------------------------------------------------ */
/* Controlled vocabularies                                             */
/* ------------------------------------------------------------------ */

/**
 * Site and crop ids are slugs (e.g. "hall-12-herb-spice", "chilli-padi"). They are plain strings because
 * the lists can grow on a device: Admin approves new hall sites and committees add crops. The vocabulary
 * is still controlled: forms only offer ids from the site and crop registries, never free text.
 */
export type SiteId = string

export type CropId = string

export type SiteStatus = 'active' | 'needs-attention' | 'establishing' | 'dormant'

export type PropagationType = 'seed' | 'cutting' | 'seedling'

export type HarvestDestination = 'pantry' | 'members' | 'food-bank' | 'compost'

/** 'canteen-food-waste': raw canteen food waste (kg) composted at the site, counted for the impact report. */
export type CompostType = 'vermicompost' | 'food-waste-compost' | 'canteen-food-waste' | 'leaf-mould' | 'none'

export type FailureCause = 'pest' | 'disease' | 'drought' | 'unknown'

/**
 * Where a record came from. Demo records are always labelled in the UI. 'setup' records are made from
 * the site setup (Beds & plants) when a bed's crop or plant count is set by hand; they are not plantings.
 */
export type RecordSource = 'demo' | 'user' | 'setup'

/** ISO date string, e.g. "2026-09-14". */
export type ISODate = string

/* ------------------------------------------------------------------ */
/* Reference data                                                      */
/* ------------------------------------------------------------------ */

export interface Bed {
  id: string // e.g. "YCT-B1" — unique across all sites
  label: string // e.g. "Bed 1 (raised)"
  /** Growing area of this bed. Demo beds leave it out: the site's area is shared equally. */
  areaSqm?: number
}

export interface Site {
  id: SiteId
  name: string
  shortName: string
  description: string
  /** [latitude, longitude] — approximate real NTU locations */
  coordinates: [number, number]
  locationNote: string
  status: SiteStatus
  statusNote: string
  managedBy: string
  /** The hall that runs it (one of src/data/halls.ts), or "Campus". Only hall sites enter the Hall Garden Cup. */
  hall: string
  /** An invented demo site (not a real NTU garden): always labelled "Demo hall site" in the UI */
  fictional?: boolean
  established: ISODate
  areaSqm: number
  beds: Bed[]
  photoAlt: string
}

export interface Crop {
  id: CropId
  name: string
  localName?: string
  scientificName: string
  /** Typical days from planting to first harvest in Singapore conditions */
  daysToFirstHarvest: number
  /** How the plant is drawn (shared parts, per-crop shape) */
  form: PlantForm
  careGuide: CareGuide
}

/** The five stages of the Learn journey, from sowing to the first harvest. */
export type LearnStage = 'sow' | 'seedling' | 'growing' | 'ready' | 'harvest'

/** Plant shapes the illustration can draw. A committee adding a crop picks the closest. */
export type PlantForm =
  | 'upright-herb' // Thai basil
  | 'spreading-herb' // mint
  | 'grass-clump' // lemongrass
  | 'rosette' // pandan
  | 'fruiting-shrub' // chilli padi
  | 'broadleaf-rhizome' // turmeric
  | 'leafy-vine' // kangkong

/** How to grow a crop at NTU, in Singapore's climate. Shown on Learn, bed pages and Grow more. */
export interface CareGuide {
  /** One line for the crop library */
  summary: string
  /** e.g. "Full sun", "Part shade" */
  light: string
  /** How it is usually started */
  startFrom: PropagationType
  /** Day (after planting) each stage begins; sowing is day 0. harvest = first harvest. */
  stageDays: Record<Exclude<LearnStage, 'sow'>, number>
  /** Two or three short, practical steps per stage */
  steps: Record<LearnStage, string[]>
  /** What "ready" looks like, in one line */
  readySign: string
  /** Notes for Singapore's heat, rain and monsoons */
  climate: string[]
  /** The three-line care card on bed pages */
  quickCare: [string, string, string]
  /** Plants per m² at the spacing NTU beds use (for planning) */
  plantsPerSqm: number
}

/* ------------------------------------------------------------------ */
/* Logs — the four forms                                               */
/* ------------------------------------------------------------------ */

interface LogBase {
  id: string
  siteId: SiteId
  source: RecordSource
  /** When the record was created (ISO datetime). */
  createdAt: string
  /** When the record was last edited (ISO datetime). Edited records show an "Edited" marker. */
  editedAt?: string
}

/** Photo attached to a log. Demo records use a placeholder, real uploads a compressed data URL. */
export type PhotoRef =
  | { kind: 'demo-placeholder'; caption: string }
  | { kind: 'upload'; dataUrl: string; fileName: string }

export interface PlantingLog extends LogBase {
  bedId: string
  cropId: CropId
  date: ISODate
  /** Number of seeds / cuttings / seedlings planted */
  quantity: number
  propagation: PropagationType
  notes?: string
}

export interface HarvestLog extends LogBase {
  bedId: string
  cropId: CropId
  date: ISODate
  weightKg: number
  destination: HarvestDestination
  /** Time spent harvesting, washing and packing */
  labourHours: number
  /** Required for every harvest */
  photo: PhotoRef
  notes?: string
}

/**
 * One per site per week. A site-week counts as "logged" for the data
 * completeness score when this record exists.
 */
export interface WeeklyInputLog extends LogBase {
  /** Monday of the week being reported */
  weekStart: ISODate
  waterLitres: number
  compostType: CompostType
  compostKg: number
  /** Maintenance hours (watering, weeding, bed prep) — excludes harvest time */
  labourHours: number
  notes?: string
}

/**
 * A plant loss: some plants in one bed lost (e.g. 3 of 20), not a whole-site failure. Shown in the UI
 * as "Plant losses"; the type keeps its original name so stored records stay readable.
 */
export interface FailureLog extends LogBase {
  bedId: string
  cropId: CropId
  date: ISODate
  cause: FailureCause
  /** Estimated plants lost — same unit as PlantingLog.quantity, so survival rate can be computed */
  estimatedLossPlants: number
  /** Plants in the bed just before the loss ("3 of 20 lost"). Older records may not have it. */
  plantsInBed?: number
  /** Plants that came back afterwards; they count as alive again. */
  recoveredPlants?: number
  description: string
  photo?: PhotoRef
}

export interface LogCollections {
  plantings: PlantingLog[]
  harvests: HarvestLog[]
  weeklyInputs: WeeklyInputLog[]
  failures: FailureLog[]
}

export type LogKind = keyof LogCollections

/* ------------------------------------------------------------------ */
/* Knowledge                                                           */
/* ------------------------------------------------------------------ */

/** Curated notes on how a crop has done at one site. Yield figures are computed from harvest logs. */
export interface CropNote {
  siteId: SiteId
  cropId: CropId
  summary: string
  problems: string[]
  fixes: string[]
  tips?: string[]
}

export interface ProblemEntry {
  id: string
  siteId: SiteId
  cropId?: CropId
  date: ISODate
  title: string
  symptoms: string
  cause: FailureCause | 'other'
  actionTaken: string
  outcome: string
  status: 'open' | 'resolved'
  reportedBy: string
  tags: string[]
}

export type ProtocolCategory = 'food-safety' | 'harvest-handling' | 'pest-response'

export interface Protocol {
  id: string
  category: ProtocolCategory
  title: string
  summary: string
  steps: string[]
  lastReviewed: ISODate
  version: string
}

/* ------------------------------------------------------------------ */
/* Handover                                                            */
/* ------------------------------------------------------------------ */

export interface Person {
  name: string
  role: string
  contact: string
}

export interface OpenIssue {
  title: string
  priority: 'high' | 'medium' | 'low'
  detail: string
}

/* ------------------------------------------------------------------ */
/* Site setup (Beds & plants)                                          */
/* ------------------------------------------------------------------ */

/** One bed as set up by hand on a site page. */
export interface BedSetup {
  id: string
  label: string
  areaSqm: number
  /** Present only when the crop or plant count was changed by hand; cropId null = nothing growing. */
  planting?: { cropId: CropId | null; plants: number }
}

/** A site's beds as edited on this device; replaces the demo bed list for that site. */
export interface SiteSetup {
  beds: BedSetup[]
  /** ISO datetime of the last save */
  savedAt: string
}

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface HandoverRecord {
  id: string
  siteId: SiteId
  /** Date the handover meeting happened */
  date: ISODate
  /** The current term's record is a living document — updated by current leads until the next handover */
  lastUpdated?: ISODate
  term: string
  outgoingLeads: Person[]
  incomingLeads: Person[]
  siteStatus: SiteStatus
  statusSummary: string
  openIssues: OpenIssue[]
  contacts: Person[]
  lessonsLearnt: string[]
  checklist: ChecklistItem[]
  /** From the handover wizard: each bed as handed over */
  beds?: { bedId: string; label: string; cropId: CropId | null; plants: number; note?: string }[]
  /** From the handover wizard: the auto-generated summary of the term */
  termSummary?: string[]
  /** The committee PIN was changed at this handover (the PIN itself is never printed) */
  pinChanged?: boolean
  /** 'user' for records made with the wizard on this device */
  source?: RecordSource
}

/* ------------------------------------------------------------------ */
/* Prices and cost assumptions                                         */
/* ------------------------------------------------------------------ */

export interface SupermarketPrice {
  cropId: CropId
  /** SGD per kg, imported product */
  importedPerKg: number
  importedOrigin: string
  /** SGD per kg, locally grown product (null if not commonly sold) */
  localPerKg: number | null
}

export interface CostAssumptions {
  currency: 'SGD'
  waterPerLitre: number
  compostPerKg: Record<CompostType, number>
  propagationPerUnit: Record<PropagationType, number>
  /** Volunteer labour is unpaid; set a shadow wage to see its value. */
  labourPerHour: number
  notes: string[]
}

/* ------------------------------------------------------------------ */
/* Demo roles and community                                            */
/* ------------------------------------------------------------------ */

/**
 * Who the visitor is pretending to be. Demo only: anyone can switch, and nothing is secured.
 * A committee member always belongs to one site.
 */
export type DemoRole =
  | { kind: 'visitor' }
  | { kind: 'student' }
  | { kind: 'committee'; siteId: SiteId }
  | { kind: 'admin' }

export type RoleKind = DemoRole['kind']

export type ContactMethod = 'email' | 'telegram' | 'phone'

/** A student's local profile, made when they join a community. Lives only in this browser. */
export interface StudentProfile {
  name: string
  /** One of the halls in src/data/halls.ts */
  hall: string
  contactMethod: ContactMethod
  contact: string
  /** Agreed that the site's committee may contact them */
  consent: boolean
  createdAt: string
  /** 'demo' for the ready-made profile (Mei Tan) */
  source: RecordSource
}

/* ------------------------------------------------------------------ */
/* Help wanted                                                         */
/* ------------------------------------------------------------------ */

/** A job a site's committee needs hands for, in one time slot. */
export interface HelpTask {
  id: string
  siteId: SiteId
  title: string
  /** What helpers will do, and what to bring */
  detail: string
  date: ISODate
  /** "HH:MM", 24-hour */
  start: string
  end: string
  helpersNeeded: number
  /** Fine for someone who has never gardened */
  beginnerFriendly: boolean
  /** The crop the task is about, if any (Learn lists tasks for its crop) */
  cropId?: CropId
  source: RecordSource
  createdAt: string
}

/** One helper's spot on a task. */
export interface TaskClaim {
  id: string
  taskId: string
  name: string
  hall?: string
  claimedAt: string
  source: RecordSource
}

/* ------------------------------------------------------------------ */
/* Communities: site profiles and joining                              */
/* ------------------------------------------------------------------ */

/** A regular weekly session at a site. weekday: 0 = Sunday … 6 = Saturday. Times "HH:MM". */
export interface Workday {
  weekday: number
  start: string
  end: string
}

/** A way to help that a site's committee is looking for. */
export interface CommunityRole {
  id: string
  title: string
  detail: string
}

/** Whether students may take some of what is ready to pick. */
export type PickPolicy = 'help-yourself' | 'ask-first' | 'committee-only'

/** What a site's community is like: shown on Join, edited by that site's committee. */
export interface SiteCommunity {
  siteId: SiteId
  /** A line or two in the committee's own voice */
  welcome: string
  workdays: Workday[]
  /** Where newcomers meet the committee */
  meetingPoint: string
  roles: CommunityRole[]
  pickPolicy: PickPolicy
}

export type JoinStatus = 'new' | 'contacted' | 'welcomed'

/* ------------------------------------------------------------------ */
/* Hall Garden Cup                                                     */
/* ------------------------------------------------------------------ */

/** A month-long, team-level challenge from the fixed list. Admin picks one per month. */
export type SpotlightId = 'steady-logger' | 'water-wise' | 'compost-champion' | 'share-the-harvest' | 'welcome-wagon' | 'new-plantings'

export interface SpotlightChallenge {
  id: SpotlightId
  title: string
  /** What the teams do, in one line */
  pitch: string
  /** How the month's standings are measured */
  measure: string
  unit: string
}

/** Semester the Cup runs over */
export interface CupSemester {
  label: string
  start: ISODate
  end: ISODate
}

/** Someone asking to join a site's community. Shows in that site's Interest inbox. */
export interface JoinRequest {
  id: string
  siteId: SiteId
  name: string
  hall: string
  contactMethod: ContactMethod
  contact: string
  /** One of the site's open roles, or 'any' */
  roleId: string
  note?: string
  /** Agreed that the committee may contact them */
  consent: boolean
  status: JoinStatus
  createdAt: string
  source: RecordSource
}

/* ------------------------------------------------------------------ */
/* New hall sites                                                      */
/* ------------------------------------------------------------------ */

export type SiteRequestStatus = 'pending' | 'approved' | 'declined'

/** A request to start a hall garden. Pending until Admin approves it; then it becomes a site. */
export interface SiteRequest {
  id: string
  /** One of src/data/halls.ts */
  hall: string
  name: string
  description: string
  coordinates: [number, number]
  locationNote: string
  beds: { label: string; areaSqm: number }[]
  requesterName: string
  /** 'student' or 'committee': who asked */
  requesterRole: RoleKind
  contactMethod: ContactMethod
  contact: string
  photo?: Extract<PhotoRef, { kind: 'upload' }>
  status: SiteRequestStatus
  createdAt: string
  decidedAt?: string
  /** Admin's note when declining */
  decisionNote?: string
  /** The site id it became, once approved */
  siteId?: SiteId
}
