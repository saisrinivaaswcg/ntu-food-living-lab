/** Display formatting shared across pages. */
import { compostOptions } from '../data'
import type { WeeklyInputLog } from '../types'

/** e.g. "12 kg vermicompost", or "None" */
export function compostSummary(r: Pick<WeeklyInputLog, 'compostType' | 'compostKg'>): string {
  if (r.compostType === 'none') return 'None'
  const label = compostOptions.find((c) => c.value === r.compostType)?.label.toLowerCase() ?? r.compostType
  return `${r.compostKg} kg ${label}`
}

const formatters = new Map<string, Intl.NumberFormat>()
function nf(maxDecimals: number, minDecimals = 0): Intl.NumberFormat {
  const key = `${maxDecimals}|${minDecimals}`
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.NumberFormat('en-SG', { maximumFractionDigits: maxDecimals, minimumFractionDigits: minDecimals })
    formatters.set(key, f)
  }
  return f
}

/** "—" stands in for "no data" everywhere. */
export const NO_DATA = '—'

export function formatNumber(n: number | null, maxDecimals = 0): string {
  return n === null ? NO_DATA : nf(maxDecimals).format(n)
}

/** A 0–1 ratio as a percentage, e.g. 0.6875 → "69%". */
export function formatPercent(ratio: number | null, decimals = 0): string {
  return ratio === null ? NO_DATA : `${nf(decimals).format(ratio * 100)}%`
}

/** e.g. 9.85 → "S$9.85" */
export function formatSGD(n: number | null): string {
  return n === null ? NO_DATA : `S$${nf(2, 2).format(n)}`
}

/** Compact axis ticks: 1,200 → "1.2K". */
export function formatCompact(n: number): string {
  return Math.abs(n) >= 1000 ? `${nf(1).format(n / 1000)}K` : nf(2).format(n)
}
