import { useMemo } from 'react'
import BarList from '../components/dashboard/BarList'
import BedBoard from '../components/dashboard/BedBoard'
import ChartFigure from '../components/dashboard/ChartFigure'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardSection from '../components/dashboard/DashboardSection'
import { WeeklyCountChart } from '../components/dashboard/lazyCharts'
import NoLogsNotice from '../components/dashboard/NoLogsNotice'
import RecordTable from '../components/dashboard/RecordTable'
import SeriesTable from '../components/dashboard/SeriesTable'
import StatRow from '../components/dashboard/StatRow'
import UpcomingHarvestList from '../components/dashboard/UpcomingHarvestList'
import EditedTag from '../components/ui/EditedTag'
import EmptyState from '../components/ui/EmptyState'
import type { Column } from '../components/ui/SortableTable'
import { failureCauseOptions, propagationOptions } from '../data'
import { useDashboard } from '../hooks/useDashboard'
import { usePageTitle } from '../hooks/usePageTitle'
import { downloadText, plantingsToCsv } from '../lib/csv'
import { formatShortDate } from '../lib/dates'
import { formatNumber, formatPercent } from '../lib/format'
import { cropName, getBed, siteName } from '../lib/lookups'
import { getSiteById } from '../lib/siteRegistry'
import {
  bedStatuses,
  daysToFirstHarvestByCrop,
  lossesByCause,
  newestFirst,
  plantingSummary,
  propagationBreakdown,
  survivalByCrop,
  upcomingHarvests,
  weeklyPlantings,
} from '../lib/metrics'
import { notifyExported } from '../lib/notify'
import type { PlantingLog } from '../types'

const propagationLabel = (value: PlantingLog['propagation']) =>
  propagationOptions.find((p) => p.value === value)?.label ?? value

const columns: Column<PlantingLog>[] = [
  {
    key: 'date',
    label: 'Date',
    sortValue: (p) => p.date + p.createdAt,
    render: (p) => (
      <>
        {formatShortDate(p.date)}
        {p.editedAt && <EditedTag />}
      </>
    ),
  },
  { key: 'site', label: 'Site', sortValue: (p) => siteName(p.siteId, true), render: (p) => siteName(p.siteId, true) },
  { key: 'bed', label: 'Bed', sortValue: (p) => p.bedId, render: (p) => getBed(p.siteId, p.bedId)?.label ?? p.bedId },
  { key: 'crop', label: 'Crop', sortValue: (p) => cropName(p.cropId), render: (p) => cropName(p.cropId) },
  {
    key: 'quantity',
    label: 'Plants',
    numeric: true,
    sortValue: (p) => p.quantity,
    render: (p) => formatNumber(p.quantity),
  },
  {
    key: 'propagation',
    label: 'Propagation',
    sortValue: (p) => propagationLabel(p.propagation),
    render: (p) => propagationLabel(p.propagation),
  },
]

/** Planting dashboard: what is in the ground, how it is doing, and what is coming. */
export default function PlantingDashboardPage() {
  usePageTitle('Planting dashboard')
  const dash = useDashboard()
  const { logs, period, filtered, siteIds, site, scope, rangeText, since, showDemoData } = dash

  const view = useMemo(
    () => ({
      summary: plantingSummary(logs, filtered, siteIds, period),
      beds: siteIds.flatMap((id) => {
        const s = getSiteById(id)
        return s ? [{ siteId: id, beds: bedStatuses(logs, s, period.end) }] : []
      }),
      weekly: weeklyPlantings(filtered, period),
      survival: survivalByCrop(logs, siteIds, period),
      propagation: propagationBreakdown(filtered),
      daysToHarvest: daysToFirstHarvestByCrop(logs, siteIds, period),
      upcoming: upcomingHarvests(logs, siteIds, period.end),
      losses: lossesByCause(filtered),
      recent: newestFirst(filtered.plantings),
    }),
    [logs, filtered, siteIds, period],
  )
  const { summary } = view
  const noPlantings = filtered.plantings.length === 0
  const noFailures = filtered.failures.length === 0

  const exportCsv = () => {
    downloadText(`ntu-plantings_${dash.periodKey}_${site}_${period.end}.csv`, plantingsToCsv(filtered.plantings))
    notifyExported(filtered.plantings.length, 'plantings')
  }

  const headline = !dash.hasAnyLogs
    ? 'Planting dashboard'
    : `${formatNumber(summary.plantsInGround)} plants in the ground across ${summary.bedsInUse} of ${summary.totalBeds} beds`

  const demoNote = showDemoData ? <span className="text-demo"> Includes demonstration data.</span> : null
  const source = (what: string) => (
    <>
      Source: {what}, {scope}, {rangeText}.{demoNote}
    </>
  )
  const lowestSurvival = view.survival[0]
  const topLoss = view.losses[0]
  const slowest = [...view.daysToHarvest].sort((a, b) => b.medianDays / b.typicalDays - a.medianDays / a.typicalDays)[0]

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 pb-10 lg:px-8 lg:pt-8">
      <DashboardHeader
        dash={dash}
        crumb="Planting"
        headline={headline}
        onExport={noPlantings ? null : exportCsv}
        exportCount={filtered.plantings.length}
        exportNoun="plantings"
      />

      {!dash.hasAnyLogs ? (
        <NoLogsNotice />
      ) : (
        <>
          <div className="py-10 lg:py-14">
            <StatRow
              stats={[
                {
                  label: 'Plants in the ground now',
                  value: summary.plantsInGround,
                  format: (n) => formatNumber(Math.round(n)),
                  detail: 'Planted, minus logged losses',
                },
                {
                  label: 'Plantings this period',
                  value: summary.plantingsInPeriod,
                  format: (n) => formatNumber(Math.round(n)),
                  detail: `Since ${since}`,
                },
                {
                  label: 'Survival rate',
                  value: summary.survival === null ? null : summary.survival * 100,
                  format: (n) => formatNumber(n, 0),
                  unit: '%',
                  detail: 'Plants not lost to pests, disease or drought',
                },
                {
                  label: 'Beds in use',
                  value: summary.bedsInUse,
                  format: (n) => formatNumber(Math.round(n)),
                  unit: `of ${summary.totalBeds}`,
                },
              ]}
            />
          </div>

          <DashboardSection
            id="beds-now"
            title="What’s growing in each bed"
            intro={`As of ${formatShortDate(period.end)}. The bar shows progress towards the crop’s typical first harvest.`}
            layout="stacked"
          >
            {view.beds.length === 0 ? <EmptyState title="No sites in this view" /> : <BedBoard sites={view.beds} />}
            <p className="mt-4 text-sm text-ink-muted">{source('planting, harvest and loss records')}</p>
          </DashboardSection>

          <DashboardSection id="planting-activity" title="Planting activity" layout="stacked">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-10">
              <ChartFigure
                title="Plantings per week"
                subtitle="number of plantings logged"
                summary={
                  noPlantings
                    ? 'Nothing was planted in this period.'
                    : `${formatNumber(summary.plantingsInPeriod)} plantings, ${formatNumber(view.weekly.reduce((a, w) => a + w.plants, 0))} plants in all.`
                }
                source={source('planting logs')}
                empty={
                  noPlantings ? (
                    <EmptyState title="No plantings in this period" detail={`Nothing was planted at ${scope}.`} />
                  ) : null
                }
                chart={
                  <WeeklyCountChart
                    data={view.weekly}
                    valueKey="plantings"
                    describe={(p) => `${p.plantings} plantings · ${p.plants} plants`}
                    ariaLabel={`Plantings per week, ${rangeText}.`}
                  />
                }
                table={
                  <SeriesTable
                    caption="Plantings per week"
                    headers={['Week of', 'Plantings (plants)']}
                    rows={view.weekly.map((w) => [dash.weekRange(w.weekStart), `${w.plantings} (${w.plants})`])}
                  />
                }
              />
              <ChartFigure
                title="How plants were propagated"
                subtitle="plants put in, by method"
                summary={
                  noPlantings
                    ? 'Nothing was planted in this period.'
                    : `Most plants went in as ${propagationLabel(view.propagation[0].propagation).toLowerCase()}s (${formatNumber(view.propagation[0].plants)} plants).`
                }
                source={source('planting logs')}
                empty={noPlantings ? <EmptyState title="No plantings in this period" /> : null}
                chart={
                  <BarList
                    ariaLabel="Plants by propagation method"
                    rows={view.propagation.map((p) => ({
                      key: p.propagation,
                      label: propagationLabel(p.propagation),
                      value: p.plants,
                      display: `${formatNumber(p.plants)} plants`,
                    }))}
                  />
                }
              />
            </div>
          </DashboardSection>

          <DashboardSection id="survival-losses" title="Survival and losses" layout="stacked">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-10">
              <ChartFigure
                title="Survival rate by crop"
                subtitle="lowest first"
                summary={
                  lowestSurvival
                    ? `${cropName(lowestSurvival.cropId)} fared worst: ${formatPercent(lowestSurvival.survival)} survived (${formatNumber(lowestSurvival.lost)} of ${formatNumber(lowestSurvival.planted)} plants lost).`
                    : 'No plantings to measure.'
                }
                source={source('planting and loss records')}
                empty={view.survival.length === 0 ? <EmptyState title="No plantings to measure" /> : null}
                chart={
                  <BarList
                    ariaLabel="Survival rate by crop"
                    max={1}
                    highlightKey={lowestSurvival?.cropId ?? null}
                    rows={view.survival.map((c) => ({
                      key: c.cropId,
                      label: cropName(c.cropId),
                      value: c.survival ?? 0,
                      display: formatPercent(c.survival),
                    }))}
                  />
                }
              />
              <ChartFigure
                title="Losses by cause"
                subtitle="plants lost (net of recoveries), from loss records"
                summary={
                  topLoss && topLoss.plants > 0
                    ? `${failureCauseOptions.find((c) => c.value === topLoss.cause)?.label} caused the most losses: ${formatNumber(topLoss.plants)} plants in ${topLoss.events} ${topLoss.events === 1 ? 'event' : 'events'}.`
                    : 'No losses logged in this period.'
                }
                source={source('loss records')}
                empty={
                  noFailures ? (
                    <EmptyState title="No losses logged in this period" detail="Good news, or nobody logged them." />
                  ) : null
                }
                chart={
                  <BarList
                    ariaLabel="Plants lost by cause"
                    rows={view.losses.map((l) => ({
                      key: l.cause,
                      label: failureCauseOptions.find((c) => c.value === l.cause)?.label ?? l.cause,
                      value: l.plants,
                      display: `${formatNumber(l.plants)} plants`,
                    }))}
                  />
                }
              />
            </div>
          </DashboardSection>

          <DashboardSection id="timing" title="Time to harvest" layout="stacked">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-10">
              <ChartFigure
                title="Days from planting to first harvest"
                subtitle="median by crop, with the typical time for Singapore"
                summary={
                  slowest
                    ? `${cropName(slowest.cropId)} took longest against its typical time: ${formatNumber(slowest.medianDays)} days vs ${slowest.typicalDays}. Counts plantings whose first harvest fell in this period.`
                    : 'No first harvests fell in this period.'
                }
                source={source('planting and harvest logs')}
                empty={view.daysToHarvest.length === 0 ? <EmptyState title="No first harvests in this period" /> : null}
                chart={
                  <BarList
                    ariaLabel="Days from planting to first harvest by crop"
                    highlightKey={slowest?.cropId ?? null}
                    markerLabel="Typical"
                    rows={view.daysToHarvest.map((d) => ({
                      key: d.cropId,
                      label: cropName(d.cropId),
                      value: d.medianDays,
                      marker: d.typicalDays,
                      display: `${formatNumber(d.medianDays)} d (typ. ${d.typicalDays})`,
                    }))}
                  />
                }
              />
              <figure aria-labelledby="upcoming-heading" className="min-w-0">
                <h3 id="upcoming-heading" className="text-lg font-semibold">
                  Expected upcoming harvests
                </h3>
                <p className="mb-4 text-sm text-ink-muted">beds not yet harvested, soonest first</p>
                {view.upcoming.length === 0 ? (
                  <EmptyState
                    title="Nothing waiting for a first harvest"
                    detail="Every bed growing now has been harvested at least once."
                  />
                ) : (
                  <>
                    <UpcomingHarvestList items={view.upcoming} />
                    <figcaption className="mt-4 border-t border-line pt-3 text-sm">
                      <p>
                        <span className="font-semibold">What this shows: </span>
                        Planting date plus each crop’s typical days to first harvest, for beds with no harvest yet.
                      </p>
                      <p className="mt-1 text-ink-muted">{source('planting and harvest logs')}</p>
                    </figcaption>
                  </>
                )}
              </figure>
            </div>
          </DashboardSection>

          <DashboardSection
            id="recent-plantings"
            title="Recent plantings"
            intro="Newest first. Select a column heading to sort; the CSV export above has every planting in this view."
            layout="stacked"
          >
            {view.recent.length === 0 ? (
              <EmptyState title="No plantings in this period" detail={`Nothing was planted at ${scope}.`} />
            ) : (
              <RecordTable
                caption="Plantings in this period"
                columns={columns}
                rows={view.recent}
                rowKey={(p) => p.id}
                initialSort={{ key: 'date', direction: 'desc' }}
                noun="plantings"
              />
            )}
          </DashboardSection>
        </>
      )}
    </div>
  )
}
