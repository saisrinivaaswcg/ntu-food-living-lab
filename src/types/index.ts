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

export type SiteId =
  | 'yunnan-culinary-trail'
  | 'hall-12-herb-spice'
  | 'earthlink-yunnan-corner'
  | 'community-herb-garden'

export type CropId =
  | 'basil'
  | 'mint'
  | 'lemongrass'
  | 'pandan'
  | 'chilli-padi'
  | 'turmeric'
  | 'kangkong'

export type SiteStatus = 'active' | 'needs-attention' | 'establishing' | 'dormant'

export type PropagationType = 'seed' | 'cutting' | 'seedling'

export type HarvestDestination = 'pantry' | 'members' | 'food-bank' | 'compost'

export type CompostType = 'vermicompost' | 'food-waste-compost' | 'leaf-mould' | 'none'

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
