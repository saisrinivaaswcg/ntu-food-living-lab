import type {
  CompostType,
  FailureCause,
  HarvestDestination,
  OpenIssue,
  ProblemEntry,
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
  { value: 'canteen-food-waste', label: 'Canteen food waste' },
  { value: 'leaf-mould', label: 'Leaf mould' },
  { value: 'none', label: 'None this week' },
]

export const failureCauseOptions: { value: FailureCause; label: string }[] = [
  { value: 'pest', label: 'Pest' },
  { value: 'disease', label: 'Disease' },
  { value: 'drought', label: 'Drought' },
  { value: 'unknown', label: 'Unknown' },
]

/** Problem-log causes: the failure causes plus "Other" for problems that aren't plant losses. */
export const problemCauseOptions: { value: ProblemEntry['cause']; label: string }[] = [
  ...failureCauseOptions,
  { value: 'other', label: 'Other' },
]

export const problemStatusLabels: Record<ProblemEntry['status'], string> = {
  open: 'Open',
  resolved: 'Resolved',
}

/** Highest priority first. */
export const issuePriorityOptions: { value: OpenIssue['priority']; label: string }[] = [
  { value: 'high', label: 'High priority' },
  { value: 'medium', label: 'Medium priority' },
  { value: 'low', label: 'Low priority' },
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
/** One-line version for narrow phone screens; screen readers still get the full notice. */
export const DEMO_DATA_SHORT_NOTICE = 'Demo data: logs, names and figures are invented.'

export const DEMO_DATA_NOTICE =
  'Demonstration data: sites are real NTU locations, but every log, name and figure shown is invented for this prototype.'
