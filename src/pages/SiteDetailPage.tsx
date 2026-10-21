import { useMemo } from 'react'
import { Handshake, HeartHandshake, Shovel } from 'lucide-react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import BedList from '../components/sites/BedList'
import KnowledgeTab from '../components/sites/KnowledgeTab'
import BedMap from '../components/sites/BedMap'
import GrowthTimeline from '../components/sites/GrowthTimeline'
import SiteHero from '../components/sites/SiteHero'
import CropChips from '../components/ui/CropChips'
import Reveal from '../components/ui/Reveal'
import { DEMO_DATA_SHORT_NOTICE } from '../data'
import { useRole } from '../hooks/useCommunity'
import { useLogs } from '../hooks/useLogs'
import { usePageTitle } from '../hooks/usePageTitle'
import { findSite } from '../lib/lookups'
import { cropsCurrentlyGrowing, growthAsOf, growthTimelines } from '../lib/metrics'
import { paths } from '../lib/paths'
import { canEditSite } from '../lib/roles'
import NotFoundPage from './NotFoundPage'

export default function SiteDetailPage() {
  const { siteId } = useParams()
  const [searchParams] = useSearchParams()
  const site = findSite(siteId)
  const { logs } = useLogs()
  const role = useRole()
  const asOf = growthAsOf(logs)
  const timelines = useMemo(() => (site ? growthTimelines(logs, [site.id], asOf) : []), [logs, site, asOf])
  const growing = useMemo(() => (site ? cropsCurrentlyGrowing(logs, site) : []), [logs, site])
  usePageTitle(site?.name ?? 'Site not found')

  // Handover notes moved to the committee workspace; keep old links working.
  if (site && searchParams.get('tab') === 'handover') return <Navigate to={paths.siteTool(site.id, 'handover')} replace />

  if (!site) {
    return (
      <NotFoundPage
        title="Site not found"
        message={`There is no site called "${siteId ?? ''}". Choose one of the sites instead.`}
      />
    )
  }

  return (
    <>
      <SiteHero site={site} growing={growing} />

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-x-10 lg:py-16">
          <section aria-labelledby="about-heading" className="lg:col-span-5">
            <h2 id="about-heading" className="font-display text-section font-medium">
              About this site
            </h2>
            <p className="mt-4 text-lg text-ink-muted">{site.description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 border-t border-line pt-4">
              <div>
                <dt className="text-sm text-ink-muted">Run by</dt>
                <dd className="font-semibold">{site.managedBy}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Established</dt>
                <dd className="font-semibold">{site.established.slice(0, 4)}</dd>
              </div>
            </dl>
            <h3 className="mt-8 mb-2 font-semibold">Crops currently growing</h3>
            <CropChips cropIds={growing} linkToLearn emptyText="No crops currently growing: no live plantings logged for this site." />
            <Link
              to={paths.joinSite(site.id)}
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-sm bg-accent px-5 font-semibold text-white hover:bg-accent-strong"
            >
              <HeartHandshake className="size-4" aria-hidden />
              Join this community
            </Link>
          </section>

          <section aria-labelledby="beds-heading" className="lg:col-span-7">
            <h2 id="beds-heading" className="font-display text-section font-medium">
              Beds & plants
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {site.beds.length} beds · {site.areaSqm} m² in all
            </p>
            <BedList site={site} />
            {canEditSite(role, site.id) && (
              <Link
                to={paths.siteTool(site.id, 'manage')}
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-sm border border-line-strong px-4 font-semibold hover:bg-sunken"
              >
                <Shovel className="size-4" aria-hidden />
                Manage beds & plants
              </Link>
            )}
          </section>
        </Reveal>

        <Reveal className="grid gap-10 border-t border-line py-12 lg:grid-cols-12 lg:gap-x-10 lg:py-16">
          <section aria-labelledby="map-heading" className="lg:col-span-7">
            <h2 id="map-heading" className="font-display text-section font-medium">
              Bed map
            </h2>
            <p className="mt-2 mb-5 text-ink-muted">Seen from above. Wider beds are larger; select one for its history.</p>
            <BedMap site={site} asOf={asOf} />
          </section>
          <section aria-labelledby="growth-heading" className="lg:col-span-5">
            <h2 id="growth-heading" className="font-display text-section font-medium">
              Growth
            </h2>
            <p className="mt-2 mb-6 text-ink-muted">From planting to first harvest, using each crop’s typical days.</p>
            {timelines.length === 0 ? (
              <p className="bg-sunken p-4 text-ink-muted">Nothing is growing here right now.</p>
            ) : (
              <ul className="space-y-8">
                {timelines.map((t) => (
                  <li key={t.status.bed.id}>
                    <GrowthTimeline timeline={t} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Reveal>

        <section aria-labelledby="knowledge-heading" className="border-t border-line pt-10 pb-12 lg:pb-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="knowledge-heading" className="font-display text-section font-medium">
                What this site has learnt
              </h2>
              <p className="mt-1 text-sm text-demo">{DEMO_DATA_SHORT_NOTICE}</p>
            </div>
            {canEditSite(role, site.id) && (
              <Link
                to={paths.siteTool(site.id, 'handover')}
                className="inline-flex min-h-12 items-center gap-2 font-semibold text-brand-700 underline underline-offset-4"
              >
                <Handshake className="size-4" aria-hidden />
                Committee handover notes
              </Link>
            )}
          </div>
          <div className="mt-6">
            <KnowledgeTab site={site} />
          </div>
        </section>
      </div>
    </>
  )
}
