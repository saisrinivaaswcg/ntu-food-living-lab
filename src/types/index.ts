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

/** Where a record came from. Demo records are always labelled in the UI. */
export type RecordSource = 'demo' | 'user'

/** ISO date string, e.g. "2026-09-14". */
export type ISODate = string

/* ------------------------------------------------------------------ */
/* Reference data                                                      */
/* ------------------------------------------------------------------ */

export interface Bed {
  id: string // e.g. "YCT-B1" — unique across all sites
  label: string // e.g. "Bed 1 (raised)"
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

export interface FailureLog extends LogBase {
  bedId: string
  cropId: CropId
  date: ISODate
  cause: FailureCause
  /** Estimated plants lost — same unit as PlantingLog.quantity, so survival rate can be computed */
  estimatedLossPlants: number
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
