import { ClipboardPen } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ChartFigure from '../components/dashboard/ChartFigure'
import CompletenessGrid from '../components/dashboard/CompletenessGrid'
import CompletenessSummary from '../components/dashboard/CompletenessSummary'
import CostTable from '../components/dashboard/CostTable'
import CropBarChart from '../components/dashboard/CropBarChart'
import DashboardSection from '../components/dashboard/DashboardSection'
import EfficiencyTable from '../components/dashboard/EfficiencyTable'
import FilterBar from '../components/dashboard/FilterBar'
import HeadlineNumbers from '../components/dashboard/HeadlineNumbers'
import Leaderboard from '../components/dashboard/Leaderboard'
import { DEFAULT_PERIOD, isPeriodKey, PERIOD_LABELS } from '../components/dashboard/periods'
import SeriesTable from '../components/dashboard/SeriesTable'
import SiteComparison from '../components/dashboard/SiteComparison'
import WeeklyLineChart from '../components/dashboard/WeeklyLineChart'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import EmptyState from '../components/ui/EmptyState'
import { costAssumptions, PRICE_SURVEY_DATE, sites, supermarketPrices } from '../data'
import { useLogs } from '../hooks/useLogs'
import { usePageTitle } from '../hooks/usePageTitle'
import { downloadText, harvestsToCsv } from '../lib/csv'
import { addDays, formatDate, formatShortDate } from '../lib/dates'
import { formatNumber, formatPercent } from '../lib/format'
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
  LEADERBOARD_COMPONENTS,
  leaderboard,
  peakWeek,
  resolvePeriod,
  siteComparison,
  sitesWithHarvests,
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
      harvestSites: sitesWithHarvests(filtered),
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

  // Plain-language headline, e.g. "84.2 kg grown across 4 sites since 20 Jul".
  const since = formatShortDate(firstWeek)
  const where = site === 'all' ? `across ${view.harvestSites} ${view.harvestSites === 1 ? 'site' : 'sites'}` : `at ${siteName(site)}`
  const headline = noHarvests
    ? `No harvests logged ${site === 'all' ? 'at any site' : `at ${siteName(site)}`} since ${since}`
    : `${formatNumber(view.kpis.totalKg, 1)} kg grown ${where} since ${since}`

  const harvestPeak = peakWeek(view.series, 'harvestKg')
  const waterPeak = peakWeek(view.series, 'waterLitres')
  const missingWaterWeeks = view.series.filter((w) => w.waterLitres === null && !w.inProgress).length
  const topCrop = view.byCrop[0]
  const demoNote = showDemoData ? <span className="text-demo"> Includes demonstration data.</span> : null
  const source = (what: string) => (
    <>
      Source: {what}, {scope}, {rangeText}.{demoNote}
    </>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 pb-10 lg:px-8 lg:pt-8">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} className="mb-4" />

      <header className="max-w-4xl">
        <h1 className="font-display text-display font-medium">{hasAnyLogs ? `${headline}.` : 'Campus harvest dashboard'}</h1>
        <p className="mt-3 max-w-2xl text-ink-muted lg:text-lg">
          {hasAnyLogs ? (
            <>
              {PERIOD_LABELS[period]}, {scope}: {rangeText}. Periods end on the latest log, not today.{demoNote}
            </>
          ) : (
            'Open to anyone. Every number comes from the logs at the four sites.'
          )}
        </p>
      </header>

      <div className="mt-8">
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
      </div>

      {!hasAnyLogs ? (
        <div className="mt-8 max-w-2xl">
          <EmptyState
            title="No logs to show"
            detail="Demo data is switched off and nothing has been logged on this device yet. Turn on demo data above, or log a harvest."
          />
          <Link
            to="/log"
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-sm bg-accent px-5 font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            <ClipboardPen className="size-4" aria-hidden />
            Log a harvest
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-10 py-10 lg:grid-cols-12 lg:gap-x-10 lg:py-14">
            <div className="lg:col-span-7">
              <HeadlineNumbers kpis={view.kpis} />
            </div>
            <div className="lg:col-span-5">
              <CompletenessSummary completeness={view.headline} weeks={view.headlineWeeks} breakdownId="weeks-logged" />
            </div>
          </div>

          <div id="weeks-logged" className="scroll-mt-24">
            <DashboardSection
              id="weeks"
              title="Which weeks were logged"
              intro="A week counts when the site has a weekly-inputs record for it. One square per site per week."
            >
              <CompletenessGrid completeness={view.headline} weeks={view.headlineWeeks} />
            </DashboardSection>
          </div>

          <DashboardSection
            id="harvest"
            title="Harvest over time"
            intro="How much was picked each week, and which crops it came from."
            layout="stacked"
          >
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
              <div className="lg:col-span-12">
                <ChartFigure
                  title="Weekly harvest"
                  subtitle="kg per week"
                  summary={
                    harvestPeak
                      ? `The biggest week was ${formatShortDate(harvestPeak.weekStart)}, with ${formatNumber(harvestPeak.harvestKg, 1)} kg.`
                      : 'No harvest was logged in this period.'
                  }
                  source={source('harvest logs')}
                  empty={noHarvests ? <EmptyState title="No harvests in this period" detail={`Nothing was logged for ${scope}.`} /> : null}
                  chart={
                    <WeeklyLineChart
                      data={view.series}
                      valueKey="harvestKg"
                      unit="kg"
                      decimals={1}
                      color="var(--color-series-harvest)"
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
              </div>
              <div className="lg:col-span-6">
                <ChartFigure
                  title="Harvest by crop"
                  subtitle="kg in this period, largest highlighted"
                  summary={
                    topCrop
                      ? `${cropName(topCrop.cropId)} gave the most: ${formatNumber(topCrop.kg, 1)} kg, ${formatPercent(view.kpis.totalKg > 0 ? topCrop.kg / view.kpis.totalKg : null)} of the harvest.`
                      : 'No harvest was logged in this period.'
                  }
                  source={source('harvest logs')}
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
              </div>
              <div className="lg:col-span-6">
                <ChartFigure
                  title="Water use"
                  subtitle="litres per week · gaps are weeks with no weekly record"
                  summary={
                    waterPeak
                      ? `Most water went on in the week of ${formatShortDate(waterPeak.weekStart)} (${formatNumber(waterPeak.waterLitres)} L). ${
                          missingWaterWeeks === 0
                            ? 'Every complete week has a record.'
                            : `${missingWaterWeeks} complete ${missingWaterWeeks === 1 ? 'week has' : 'weeks have'} no record.`
                        }`
                      : 'No water was logged in this period.'
                  }
                  source={source('weekly input records')}
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
                      color="var(--color-series-water)"
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
            </div>
          </DashboardSection>

          <DashboardSection
            id="leaderboard"
            title="Inter-hall challenge"
            layout="stacked"
            intro={
              <>
                Not yield alone. {LEADERBOARD_COMPONENTS.map((c) => c.label).join(', ')} are each scored 0–100 against
                the best site, then blended using the weights shown. Yield is per m², so small sites aren’t penalised.
              </>
            }
          >
            <Leaderboard entries={view.board} highlight={site} />
          </DashboardSection>

          <DashboardSection id="sites" title="Site comparison" intro="All four sites side by side for the chosen period.">
            <SiteComparison rows={view.siteRows} highlight={site} completeWeeks={p.completeWeeks.length} />
          </DashboardSection>

          <DashboardSection
            id="efficiency"
            title="Efficiency by crop"
            intro="Water and weekly labour are logged per site, then shared across crops by the beds each crop held that week. Select a column heading to sort."
          >
            <EfficiencyTable rows={view.efficiency} />
          </DashboardSection>

          <DashboardSection
            id="cost"
            title="Cost per kg: campus vs supermarket"
            layout="stacked"
            intro={`Campus cost is water, compost, seeds and labour divided by kg harvested. Supermarket prices surveyed ${PRICE_SURVEY_DATE}.`}
          >
            <CostTable rows={view.costs} />
          </DashboardSection>
        </>
      )}
    </div>
  )
}
