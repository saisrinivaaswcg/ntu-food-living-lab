import { ClipboardPen } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ChartCard from '../components/dashboard/ChartCard'
import CompletenessCard from '../components/dashboard/CompletenessCard'
import CostTable from '../components/dashboard/CostTable'
import CropBarChart from '../components/dashboard/CropBarChart'
import EfficiencyTable from '../components/dashboard/EfficiencyTable'
import FilterBar from '../components/dashboard/FilterBar'
import KpiTiles from '../components/dashboard/KpiTiles'
import Leaderboard from '../components/dashboard/Leaderboard'
import { DEFAULT_PERIOD, isPeriodKey, PERIOD_LABELS } from '../components/dashboard/periods'
import SeriesTable from '../components/dashboard/SeriesTable'
import SiteComparison from '../components/dashboard/SiteComparison'
import WeeklyLineChart from '../components/dashboard/WeeklyLineChart'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import EmptyState from '../components/ui/EmptyState'
import { costAssumptions, sites, supermarketPrices } from '../data'
import { useLogs } from '../hooks/useLogs'
import { usePageTitle } from '../hooks/usePageTitle'
import { downloadText, harvestsToCsv } from '../lib/csv'
import { addDays, formatDate, formatShortDate } from '../lib/dates'
import { formatNumber } from '../lib/format'
import { setShowDemoData } from '../lib/logStore'
import { cropName, findSite, siteName } from '../lib/lookups'
import {
  computeCompleteness,
  computeKpis,
  cropCosts,
  cropEfficiency,
  filterLogs,
  harvestByCrop,
  lastCompleteWeeks,
  latestLogDate,
  leaderboard,
  resolvePeriod,
  siteComparison,
  weeklySeries,
  type PeriodKey,
  type SiteFilter,
} from '../lib/metrics'

/** Public dashboard. All numbers come from lib/metrics; this page only arranges them. */
export default function DashboardPage() {
  usePageTitle('Dashboard')
  const { logs, showDemoData } = useLogs()
  const [params, setParams] = useSearchParams()

  // Filters live in the URL so a view can be shared or bookmarked.
  const periodParam = params.get('period')
  const period: PeriodKey = isPeriodKey(periodParam) ? periodParam : DEFAULT_PERIOD
  const site: SiteFilter = findSite(params.get('site') ?? undefined)?.id ?? 'all'
  const setFilter = (key: 'period' | 'site', value: string, defaultValue: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === defaultValue) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )

  const view = useMemo(() => {
    const p = resolvePeriod(period, logs)
    const filtered = filterLogs(logs, p, site)
    const siteIds = site === 'all' ? sites.map((s) => s.id) : [site]
    const headlineWeeks = lastCompleteWeeks(p.end, 4)
    const rows = siteComparison(logs, p)
    return {
      period: p,
      filtered,
      kpis: computeKpis(filtered),
      headlineWeeks,
      headline: computeCompleteness(
        logs.weeklyInputs.filter((w) => siteIds.includes(w.siteId)),
        siteIds,
        headlineWeeks,
      ),
      series: weeklySeries(filtered, p),
      byCrop: harvestByCrop(filtered),
      efficiency: cropEfficiency(filtered, logs.plantings),
      costs: cropCosts(filtered, logs.plantings, costAssumptions, supermarketPrices),
      siteRows: rows,
      board: leaderboard(rows),
    }
  }, [logs, period, site])

  const hasAnyLogs = latestLogDate(logs) !== null
  const { period: p, filtered } = view
  const firstWeek = p.weeks[0]
  const rangeText = `${formatShortDate(firstWeek)} – ${formatDate(p.end)}`
  const scope = site === 'all' ? 'all sites' : siteName(site)

  const exportCsv = () =>
    downloadText(`ntu-harvests_${period}_${site}_${p.end}.csv`, harvestsToCsv(filtered.harvests))

  const noHarvests = filtered.harvests.length === 0
  const noWeekly = filtered.weeklyInputs.length === 0

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 lg:px-8 lg:py-8">
      <div>
        <Breadcrumbs items={[{ label: 'Dashboard' }]} className="mb-2" />
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Dashboard</h1>
        <p className="mt-1 text-ink-muted">
          {hasAnyLogs ? (
            <>
              {PERIOD_LABELS[period]}, {scope}: {rangeText}. Periods end on the latest log, not today.
              {showDemoData && <span className="text-demo"> Includes demonstration data.</span>}
            </>
          ) : (
            'Open to anyone. Every number comes from the logs at the four sites.'
          )}
        </p>
      </div>

      <FilterBar
        period={period}
        onPeriod={(v) => setFilter('period', v, DEFAULT_PERIOD)}
        site={site}
        onSite={(v) => setFilter('site', v, 'all')}
        showDemo={showDemoData}
        onShowDemo={setShowDemoData}
        onExport={noHarvests ? null : exportCsv}
        exportCount={filtered.harvests.length}
      />

      {!hasAnyLogs ? (
        <div className="rounded-card bg-surface p-6 shadow-card">
          <EmptyState
            title="No logs to show"
            detail="Demo data is switched off and nothing has been logged on this device yet. Turn on demo data above, or log a harvest."
          />
          <Link
            to="/log"
            className="mx-auto mt-4 flex min-h-12 w-fit items-center gap-2 rounded-xl bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800"
          >
            <ClipboardPen className="size-4" aria-hidden />
            Go to Log
          </Link>
        </div>
      ) : (
        <>
          <CompletenessCard completeness={view.headline} weeks={view.headlineWeeks} />
          <KpiTiles kpis={view.kpis} />

          <ChartCard
            title="Harvest over time"
            subtitle="kg per week"
            empty={noHarvests ? <EmptyState title="No harvests in this period" detail={`Nothing was logged for ${scope}.`} /> : null}
            chart={
              <WeeklyLineChart
                data={view.series}
                valueKey="harvestKg"
                unit="kg"
                decimals={2}
                ariaLabel={`Weekly harvest in kilograms, ${rangeText}. Total ${formatNumber(view.kpis.totalKg, 1)} kg.`}
              />
            }
            table={
              <SeriesTable
                caption="Harvest per week"
                headers={['Week of', 'Harvest']}
                rows={view.series.map((w) => [
                  `${formatShortDate(w.weekStart)}${w.inProgress ? ' (in progress)' : ''}`,
                  `${formatNumber(w.harvestKg, 2)} kg`,
                ])}
              />
            }
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Harvest by crop"
              subtitle="kg in this period"
              empty={noHarvests ? <EmptyState title="No harvests in this period" /> : null}
              chart={<CropBarChart data={view.byCrop} />}
              table={
                <SeriesTable
                  caption="Harvest by crop"
                  headers={['Crop', 'Harvest']}
                  rows={view.byCrop.map((c) => [cropName(c.cropId), `${formatNumber(c.kg, 2)} kg`])}
                />
              }
            />
            <ChartCard
              title="Water use over time"
              subtitle="litres per week · gaps are weeks with no weekly record"
              empty={
                noWeekly ? (
                  <EmptyState title="No weekly records in this period" detail="Water is logged with the weekly inputs form." />
                ) : null
              }
              chart={
                <WeeklyLineChart
                  data={view.series}
                  valueKey="waterLitres"
                  unit="L"
                  decimals={0}
                  missingLabel="No weekly record"
                  ariaLabel={`Weekly water use in litres, ${rangeText}. Total ${formatNumber(view.kpis.waterLitres)} L.`}
                />
              }
              table={
                <SeriesTable
                  caption="Water use per week"
                  headers={['Week of', 'Water']}
                  rows={view.series.map((w) => [
                    `${formatShortDate(w.weekStart)} – ${formatShortDate(addDays(w.weekStart, 6))}`,
                    w.waterLitres === null ? 'Not logged' : `${formatNumber(w.waterLitres)} L`,
                  ])}
                />
              }
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Leaderboard entries={view.board} highlight={site} />
            <SiteComparison rows={view.siteRows} highlight={site} completeWeeks={p.completeWeeks.length} />
          </div>

          <EfficiencyTable rows={view.efficiency} />
          <CostTable rows={view.costs} />
        </>
      )}
    </div>
  )
}
