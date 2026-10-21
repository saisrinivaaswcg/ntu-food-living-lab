import { BookOpen, Droplets, HeartHandshake, Scale, Sprout } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import EmptyState from '../components/ui/EmptyState'
import { DEMO_DATA_SHORT_NOTICE, pickPolicyOptions } from '../data'
import { useCommunity } from '../hooks/useCommunity'
import { useLogs } from '../hooks/useLogs'
import { usePageTitle } from '../hooks/usePageTitle'
import { communityFor } from '../lib/community'
import { formatDate } from '../lib/dates'
import { findCrop, findSite } from '../lib/lookups'
import { bedStatuses, GROWTH_STAGES, growthAsOf, growthStage } from '../lib/metrics'
import { harvestFormFor, paths, weeklyFormFor } from '../lib/paths'
import { usesWorkspace } from '../lib/roles'
import NotFoundPage from './NotFoundPage'

/**
 * One bed, as reached from its QR card: what's growing, its stage, a three-line care card, and big
 * buttons to log a harvest or watering, pre-filled for this bed.
 */
export default function BedPage() {
  const { siteId, bedId } = useParams()
  const site = findSite(siteId)
  const { logs } = useLogs()
  const { role, communities } = useCommunity()
  const asOf = growthAsOf(logs)
  const status = useMemo(() => (site ? bedStatuses(logs, site, asOf).find((s) => s.bed.id === bedId) : undefined), [logs, site, asOf, bedId])
  usePageTitle(status ? `${status.bed.label} · ${site?.shortName}` : 'Bed not found')

  if (!site || !status) {
    return (
      <NotFoundPage
        title="Bed not found"
        message={site ? `${site.name} has no bed called "${bedId ?? ''}". It may have been renamed or removed.` : 'There is no site with that name.'}
      />
    )
  }

  const crop = status.planting ? findCrop(status.planting.cropId) : undefined
  const stage = growthStage(status, asOf)
  const stageLabel = GROWTH_STAGES.find((s) => s.stage === stage)?.label
  const policy = pickPolicyOptions.find((p) => p.value === communityFor(communities, site.id).pickPolicy)
  const committee = usesWorkspace(role)

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Sites', to: paths.sites }, { label: site.shortName, to: paths.site(site.id) }, { label: status.bed.label }]} />
      <p className="text-sm font-semibold text-ink-muted">{site.name}</p>
      <h1 className="font-display text-display font-medium">{status.bed.label}</h1>
      <p className="mt-2 text-sm text-demo">{DEMO_DATA_SHORT_NOTICE}</p>

      {!crop || !status.planting ? (
        <div className="mt-8">
          <EmptyState title="Nothing growing in this bed right now" detail="It’s resting or waiting for the next planting day." />
        </div>
      ) : (
        <>
          <section aria-labelledby="crop-heading" className="mt-8 rounded-card bg-surface p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="crop-heading" className="font-display text-3xl font-medium">
                  {crop.name}
                </h2>
                <p className="text-ink-muted italic">{crop.scientificName}</p>
              </div>
              {stageLabel && (
                <span className={`rounded-sm px-3 py-1 font-semibold ${stage === 'ready' || stage === 'harvesting' ? 'bg-accent-bg text-accent-strong' : 'bg-brand-50 text-brand-800'}`}>
                  {stageLabel}
                </span>
              )}
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-sunken" aria-hidden>
              <div className="h-full origin-left rounded-full bg-brand-600" style={{ transform: `scaleX(${status.growthProgress})` }} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-ink-muted">Planted</dt>
                <dd className="font-semibold">{formatDate(status.planting.date)}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Plants</dt>
                <dd className="font-semibold">{status.plantsAlive}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">{status.firstHarvest ? 'First harvest' : 'Expected first harvest'}</dt>
                <dd className="font-semibold">{formatDate(status.firstHarvest ?? status.expectedFirstHarvest ?? status.planting.date)}</dd>
              </div>
            </dl>

            <h3 className="mt-6 font-semibold">Care in three lines</h3>
            <ol className="mt-2 space-y-2">
              {crop.careGuide.quickCare.map((line, i) => (
                <li key={line} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm text-white tabular-nums">{i + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
            <Link to={paths.learnCrop(crop.id)} className="mt-4 inline-flex min-h-12 items-center gap-1.5 font-semibold text-brand-700 underline underline-offset-4">
              <BookOpen className="size-4" aria-hidden />
              Full growing guide
            </Link>
          </section>

          {policy && (stage === 'ready' || stage === 'harvesting') && (
            <p className="mt-4 flex items-start gap-2 rounded-sm bg-sunken px-4 py-3">
              <Sprout className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden />
              <span>
                <strong className="font-semibold">Ready to pick · {policy.label}.</strong> {policy.detail}
              </span>
            </p>
          )}
        </>
      )}

      <section aria-labelledby="log-heading" className="mt-8">
        <h2 id="log-heading" className="font-display text-2xl font-medium">
          Log for this bed
        </h2>
        {!committee && <p className="mt-1 text-sm text-ink-muted">For the site’s committee. You’ll be offered a one-click role switch (demo login).</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            to={harvestFormFor(site.id, status.bed.id, status.planting?.cropId)}
            className="flex min-h-16 items-center justify-center gap-2 rounded-sm bg-accent px-5 text-lg font-semibold text-white hover:bg-accent-strong"
          >
            <Scale className="size-5" aria-hidden />
            Log harvest
          </Link>
          <Link
            to={weeklyFormFor(site.id)}
            className="flex min-h-16 items-center justify-center gap-2 rounded-sm bg-brand-700 px-5 text-lg font-semibold text-white hover:bg-brand-800"
          >
            <Droplets className="size-5" aria-hidden />
            Log watering
          </Link>
        </div>
        <p className="mt-2 text-sm text-ink-muted">Watering is logged once a week for the whole site (water, compost and hours).</p>
      </section>

      <Link to={paths.joinSite(site.id)} className="mt-10 flex min-h-12 items-center gap-2 border-t border-line pt-6 font-semibold text-brand-700 underline underline-offset-4">
        <HeartHandshake className="size-5" aria-hidden />
        Join the {site.shortName} garden
      </Link>
    </div>
  )
}
