import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_PERIOD, isPeriodKey, PERIOD_LABELS } from '../components/dashboard/periods'
import { sites } from '../data'
import { addDays, formatDate, formatShortDate } from '../lib/dates'
import { findSite, siteName } from '../lib/lookups'
import { filterLogs, latestLogDate, resolvePeriod, type PeriodKey, type SiteFilter } from '../lib/metrics'
import type { SiteId } from '../types'
import { useLogs } from './useLogs'

/**
 * Filters and scope shared by the three dashboards. Period and site live in the URL, so they carry
 * across the Overview / Harvest / Planting tabs and a view can be shared or bookmarked.
 */
export function useDashboard() {
  const { logs, showDemoData } = useLogs()
  const [params, setParams] = useSearchParams()

  const periodParam = params.get('period')
  const periodKey: PeriodKey = isPeriodKey(periodParam) ? periodParam : DEFAULT_PERIOD
  const site: SiteFilter = findSite(params.get('site') ?? undefined)?.id ?? 'all'

  const setFilter = (key: 'period' | 'site', value: string) => {
    const defaultValue = key === 'period' ? DEFAULT_PERIOD : 'all'
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === defaultValue) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )
  }

  const base = useMemo(() => {
    const period = resolvePeriod(periodKey, logs)
    const siteIds: SiteId[] = site === 'all' ? sites.map((s) => s.id) : [site]
    return { period, siteIds, filtered: filterLogs(logs, period, site) }
  }, [logs, periodKey, site])

  const { period } = base
  const rangeText = `${formatShortDate(period.weeks[0])} – ${formatDate(period.end)}`
  const scope = site === 'all' ? 'all sites' : siteName(site)

  return {
    logs,
    showDemoData,
    periodKey,
    periodLabel: PERIOD_LABELS[periodKey],
    site,
    setFilter,
    ...base,
    hasAnyLogs: latestLogDate(logs) !== null,
    rangeText,
    scope,
    /** e.g. "20 Jul" — the first day the charts show */
    since: formatShortDate(period.weeks[0]),
    /** Week label helper for tables: "20 Jul – 26 Jul" */
    weekRange: (monday: string) => `${formatShortDate(monday)} – ${formatShortDate(addDays(monday, 6))}`,
  }
}

export type DashboardScope = ReturnType<typeof useDashboard>
