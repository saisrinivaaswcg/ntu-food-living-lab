import type { PeriodKey } from '../../lib/metrics'

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  '4w': 'Last 4 weeks',
  '3m': 'Last 3 months',
  all: 'All',
}

export const DEFAULT_PERIOD: PeriodKey = '3m'

export function isPeriodKey(value: string | null): value is PeriodKey {
  return value !== null && value in PERIOD_LABELS
}
