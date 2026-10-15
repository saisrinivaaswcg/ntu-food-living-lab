/** Display formatting shared across pages. */
import { compostOptions } from '../data'
import type { WeeklyInputLog } from '../types'

/** e.g. "12 kg vermicompost", or "None" */
export function compostSummary(r: Pick<WeeklyInputLog, 'compostType' | 'compostKg'>): string {
  if (r.compostType === 'none') return 'None'
  const label = compostOptions.find((c) => c.value === r.compostType)?.label.toLowerCase() ?? r.compostType
  return `${r.compostKg} kg ${label}`
}
