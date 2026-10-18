import { useMemo } from 'react'
import BarList from '../components/dashboard/BarList'
import ChartFigure from '../components/dashboard/ChartFigure'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardSection from '../components/dashboard/DashboardSection'
import { CropBarChart, SiteSmallMultiples } from '../components/dashboard/lazyCharts'
import HarvestGallery from '../components/dashboard/HarvestGallery'
import NoLogsNotice from '../components/dashboard/NoLogsNotice'
import PhotoThumb from '../components/dashboard/PhotoThumb'
import RecordTable from '../components/dashboard/RecordTable'
import SeriesTable from '../components/dashboard/SeriesTable'
import StatRow from '../components/dashboard/StatRow'
import EmptyState from '../components/ui/EmptyState'
import type { Column } from '../components/ui/SortableTable'
import { destinationOptions } from '../data'
import { useDashboard } from '../hooks/useDashboard'
import { usePageTitle } from '../hooks/usePageTitle'
import { downloadText, harvestsToCsv } from '../lib/csv'
import { formatShortDate } from '../lib/dates'
import { formatNumber, formatPercent } from '../lib/format'
import { cropName, getBed, siteName } from '../lib/lookups'
import {
  harvestByCrop,
  harvestByDestination,
  harvestsWithPhotos,
  harvestSummary,
  newestFirst,
  weeklyHarvestBySite,
} from '../lib/metrics'
import { notifyExported } from '../lib/notify'
import type { HarvestLog } from '../types'

const destinationLabel = (value: HarvestLog['destination']) =>
  destinationOptions.find((d) => d.value === value)?.label ?? value

const columns: Column<HarvestLog>[] = [
  {
    key: 'photo',
    label: 'Photo',
    sortValue: (h) => (h.photo.kind === 'upload' ? 1 : 0),
    render: (h) => (
      <span className="block size-12 overflow-hidden rounded-sm">
        <PhotoThumb photo={h.photo} alt={`${cropName(h.cropId)} harvest`} />
      </span>
    ),
  },
  { key: 'date', label: 'Date', sortValue: (h) => h.date + h.createdAt, render: (h) => formatShortDate(h.date) },
  { key: 'site', label: 'Site', sortValue: (h) => siteName(h.siteId, true), render: (h) => siteName(h.siteId, true) },
  { key: 'bed', label: 'Bed', sortValue: (h) => h.bedId, render: (h) => getBed(h.siteId, h.bedId)?.label ?? h.bedId },
  { key: 'crop', label: 'Crop', sortValue: (h) => cropName(h.cropId), render: (h) => cropName(h.cropId) },
  { key: 'kg', label: 'kg', numeric: true, sortValue: (h) => h.weightKg, render: (h) => formatNumber(h.weightKg, 2) },
  {
    key: 'destination',
    label: 'Went to',
    sortValue: (h) => destinationLabel(h.destination),
    render: (h) => destinationLabel(h.destination),
  },
  { key: 'labour', label: 'Labour h', numeric: true, sortValue: (h) => h.labourHours, render: (h) => formatNumber(h.labourHours, 2) },
]

/** Harvest dashboard: how much, from where, of what, and where it went. */
export default function HarvestDashboardPage() {
  usePageTitle('Harvest dashboard')
  const dash = useDashboard()
  const { period, filtered, siteIds, site, scope, rangeText, since, showDemoData } = dash

  const view = useMemo(
    () => ({
      summary: harvestSummary(filtered, siteIds),
      bySite: weeklyHarvestBySite(filtered, period, siteIds),
      byCrop: harvestByCrop(filtered),
      byDestination: harvestByDestination(filtered),
      photos: harvestsWithPhotos(filtered),
      recent: newestFirst(filtered.harvests),
    }),
    [filtered, period, siteIds],
  )
  const { summary } = view
  const none = filtered.harvests.length === 0

  const exportCsv = () => {
    downloadText(`ntu-harvests_${dash.periodKey}_${site}_${period.end}.csv`, harvestsToCsv(filtered.harvests))
    notifyExported(filtered.harvests.length, 'harvests')
  }

  const headline = !dash.hasAnyLogs
    ? 'Harvest dashboard'
    : none
      ? `No harvests logged ${site === 'all' ? 'at any site' : `at ${siteName(site)}`} since ${since}`
      : `${formatNumber(summary.harvests)}\u00a0harvests, ${formatNumber(summary.totalKg, 1)}\u00a0kg since ${since}`

  const demoNote = showDemoData ? <span className="text-demo"> Includes demonstration data.</span> : null
  const source = (what: string) => (
    <>
      Source: {what}, {scope}, {rangeText}.{demoNote}
    </>
  )
  const empty = <EmptyState title="No harvests in this period" detail={`Nothing was logged for ${scope}.`} />
  const leadSite = [...view.bySite].sort((a, b) => b.totalKg - a.totalKg)[0]
  const topDestination = view.byDestination[0]

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 pb-10 lg:px-8 lg:pt-8">
      <DashboardHeader
        dash={dash}
        crumb="Harvest"
        headline={headline}
        onExport={none ? null : exportCsv}
        exportCount={filtered.harvests.length}
        exportNoun="harvests"
      />

      {!dash.hasAnyLogs ? (
        <NoLogsNotice />
      ) : (
        <>
          <div className="py-10 lg:py-14">
            <StatRow
              stats={[
                { label: 'Harvested', value: summary.totalKg, format: (n) => formatNumber(n, 1), unit: 'kg' },
                { label: 'Harvests logged', value: summary.harvests, format: (n) => formatNumber(Math.round(n)) },
                {
                  label: 'Per m² of growing area',
                  value: summary.kgPerSqm,
                  format: (n) => formatNumber(n, 2),
                  unit: 'kg',
                  detail: `Across ${siteIds.length === 1 ? 'the site' : `${siteIds.length} sites`}`,
                },
                {
                  label: 'Top crop',
                  value: summary.topCrop?.kg ?? null,
                  format: (n) => formatNumber(n, 1),
                  unit: 'kg',
                  detail: summary.topCrop ? cropName(summary.topCrop.cropId) : 'No harvests yet',
                },
              ]}
            />
          </div>

          <DashboardSection
            id="by-site"
            title="Kg per week, by site"
            intro="One small chart per site on the same scale, so the sites can be compared at a glance."
          >
            <ChartFigure
              title="Weekly harvest by site"
              subtitle="kg per week · shared scale"
              summary={
                leadSite && leadSite.totalKg > 0
                  ? `${siteName(leadSite.siteId)} harvested the most: ${formatNumber(leadSite.totalKg, 1)} kg.`
                  : 'No harvest was logged in this period.'
              }
              source={source('harvest logs')}
              empty={none ? empty : null}
              minHeight="20rem"
              chart={<SiteSmallMultiples series={view.bySite} />}
              table={
                <SeriesTable
                  caption="Harvest per site"
                  headers={['Site', 'Harvest']}
                  rows={view.bySite.map((s) => [siteName(s.siteId), `${formatNumber(s.totalKg, 2)} kg`])}
                />
              }
            />
          </DashboardSection>

          <DashboardSection id="crops-destinations" title="What was picked, and where it went" layout="stacked">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-10">
              <ChartFigure
                title="Harvest by crop"
                subtitle="kg in this period, largest highlighted"
                summary={
                  view.byCrop[0]
                    ? `${cropName(view.byCrop[0].cropId)} gave the most: ${formatNumber(view.byCrop[0].kg, 1)} kg, ${formatPercent(summary.totalKg > 0 ? view.byCrop[0].kg / summary.totalKg : null)} of the harvest.`
                    : 'No harvest was logged in this period.'
                }
                source={source('harvest logs')}
                empty={none ? empty : null}
                chart={<CropBarChart data={view.byCrop} />}
                table={
                  <SeriesTable
                    caption="Harvest by crop"
                    headers={['Crop', 'Harvest']}
                    rows={view.byCrop.map((c) => [cropName(c.cropId), `${formatNumber(c.kg, 2)} kg`])}
                  />
                }
              />
              <ChartFigure
                title="Where the harvest went"
                subtitle="kg by destination"
                summary={
                  topDestination && topDestination.kg > 0
                    ? `${formatPercent(topDestination.kg / summary.totalKg)} went to ${destinationLabel(topDestination.destination).toLowerCase()}; ${formatNumber(view.byDestination.find((d) => d.destination === 'compost')?.kg ?? 0, 2)} kg was composted.`
                    : 'No harvest was logged in this period.'
                }
                source={source('harvest logs')}
                empty={none ? empty : null}
                chart={
                  <BarList
                    ariaLabel="Harvest by destination"
                    rows={view.byDestination.map((d) => ({
                      key: d.destination,
                      label: destinationLabel(d.destination),
                      value: d.kg,
                      display: `${formatNumber(d.kg, 1)} kg`,
                    }))}
                  />
                }
              />
            </div>
          </DashboardSection>

          <DashboardSection
            id="photos"
            title="Harvest photos"
            intro="Every harvest is logged with a photo. Select one to see it large with its record. Demo records show a placeholder instead of a photo."
            layout="stacked"
          >
            {view.photos.length === 0 ? (
              <EmptyState title="No harvest photos in this period" detail={`Nothing was logged for ${scope}.`} />
            ) : (
              <>
                <HarvestGallery harvests={view.photos} />
                <p className="mt-4 text-sm text-ink-muted">{source('harvest logs')}</p>
              </>
            )}
          </DashboardSection>

          <DashboardSection
            id="recent-harvests"
            title="Recent harvests"
            intro="Newest first. Select a column heading to sort; the CSV export above has every harvest in this view."
            layout="stacked"
          >
            {view.recent.length === 0 ? (
              empty
            ) : (
              <RecordTable
                caption="Harvests in this period"
                columns={columns}
                rows={view.recent}
                rowKey={(h) => h.id}
                initialSort={{ key: 'date', direction: 'desc' }}
                noun="harvests"
              />
            )}
          </DashboardSection>
        </>
      )}
    </div>
  )
}
