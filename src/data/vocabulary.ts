import type {
  CompostType,
  FailureCause,
  HarvestDestination,
  PropagationType,
  ProtocolCategory,
  SiteStatus,
} from '../types'

/**
 * Display labels for every controlled vocabulary.
 * Forms render these as dropdowns / big buttons — never free text.
 */

export const propagationOptions: { value: PropagationType; label: string }[] = [
  { value: 'seed', label: 'Seed' },
  { value: 'cutting', label: 'Cutting' },
  { value: 'seedling', label: 'Seedling' },
]

export const destinationOptions: { value: HarvestDestination; label: string; hint: string }[] = [
  { value: 'pantry', label: 'Pantry', hint: 'Campus student pantry' },
  { value: 'members', label: 'Members', hint: 'Shared with site volunteers' },
  { value: 'food-bank', label: 'Food bank', hint: 'Donated off campus' },
  { value: 'compost', label: 'Compost', hint: 'Damaged or past its best' },
]

export const compostOptions: { value: CompostType; label: string }[] = [
  { value: 'vermicompost', label: 'Vermicompost' },
  { value: 'food-waste-compost', label: 'Food-waste compost (campus)' },
  { value: 'leaf-mould', label: 'Leaf mould' },
  { value: 'none', label: 'None this week' },
]

export const failureCauseOptions: { value: FailureCause; label: string }[] = [
  { value: 'pest', label: 'Pest' },
  { value: 'disease', label: 'Disease' },
  { value: 'drought', label: 'Drought' },
  { value: 'unknown', label: 'Unknown' },
]

export const siteStatusLabels: Record<SiteStatus, string> = {
  active: 'Active',
  'needs-attention': 'Needs attention',
  establishing: 'Establishing',
  dormant: 'Dormant',
}

export const protocolCategoryLabels: Record<ProtocolCategory, string> = {
  'food-safety': 'Food safety',
  'harvest-handling': 'Harvest handling',
  'pest-response': 'Pest response',
}

/** Shown wherever demo records appear. */
export const DEMO_DATA_NOTICE =
  'Demonstration data: sites are real NTU locations, but every log, name and figure shown is invented for this prototype.'
