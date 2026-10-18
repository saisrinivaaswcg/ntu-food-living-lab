import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import HandoverTab from '../components/sites/HandoverTab'
import KnowledgeTab from '../components/sites/KnowledgeTab'
import BedMap from '../components/sites/BedMap'
import GrowthTimeline from '../components/sites/GrowthTimeline'
import SiteHero from '../components/sites/SiteHero'
import SiteSetupEditor from '../components/sites/SiteSetupEditor'
import SiteTabs from '../components/sites/SiteTabs'
import { SITE_TABS, panelId, tabId, type SiteTab } from '../components/sites/siteTabItems'
import CropChips from '../components/ui/CropChips'
import Reveal from '../components/ui/Reveal'
import { DEMO_DATA_SHORT_NOTICE } from '../data'
import { useLogs } from '../hooks/useLogs'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatDate } from '../lib/dates'
import { cropName, findSite } from '../lib/lookups'
import { bedStatuses, cropsCurrentlyGrowing, growthAsOf, growthTimelines, latestLogDate } from '../lib/metrics'
import { todayISO } from '../lib/dates'
import NotFoundPage from './NotFoundPage'

export default function SiteDetailPage() {
  const { siteId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  // The tab lives in the URL so it can be linked to and survives a reload.
  const tab: SiteTab = SITE_TABS.find((t) => t.id === searchParams.get('tab'))?.id ?? 'knowledge'
  function selectTab(next: SiteTab) {
    setSearchParams(next === 'knowledge' ? {} : { tab: next }, { replace: true })
  }
  const site = findSite(siteId)
  const { logs } = useLogs()
  const beds = useMemo(() => (site ? bedStatuses(logs, site, latestLogDate(logs) ?? todayISO()) : []), [logs, site])
  const asOf = growthAsOf(logs)
  const timelines = useMemo(() => (site ? growthTimelines(logs, [site.id], asOf) : []), [logs, site, asOf])
  const growing = useMemo(() => (site ? cropsCurrentlyGrowing(logs, site) : []), [logs, site])
  usePageTitle(site?.name ?? 'Site not found')

  if (!site) {
    return (
      <NotFoundPage
        title="Site not found"
        message={`There is no site called "${siteId ?? ''}". Choose one of the four campus sites instead.`}
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
            <CropChips cropIds={growing} emptyText="No crops currently growing — no live plantings logged for this site." />
          </section>

          <section aria-labelledby="beds-heading" className="lg:col-span-7">
            <h2 id="beds-heading" className="font-display text-section font-medium">
              Beds & plants
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {site.beds.length} beds · {site.areaSqm} m² in all
            </p>
            {beds.length === 0 ? (
              <p className="mt-4 bg-sunken p-4 text-ink-muted">No beds recorded for this site.</p>
            ) : (
              <ul className="mt-4 border-t border-ink">
                {beds.map(({ bed, planting, plantsAlive }) => (
                  <li
                    key={bed.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line py-3"
                  >
                    <span>
                      <span className="font-semibold">{bed.label}</span>
                      <span className="text-sm text-ink-muted"> · {bed.areaSqm} m²</span>
                    </span>
                    <span className={planting ? 'text-ink' : 'text-ink-muted'}>
                      {planting ? (
                        <>
                          {cropName(planting.cropId)} · <span className="tabular-nums">{plantsAlive}</span> plants
                          <span className="text-ink-muted">
                            {' '}
                            · {planting.source === 'setup' ? 'set by hand' : `planted ${formatDate(planting.date)}`}
                          </span>
                        </>
                      ) : (
                        'Nothing growing'
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5">
              {/* key: a fresh editor when the site changes */}
              <SiteSetupEditor key={site.id} site={site} />
            </div>
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

        <div className="border-t border-line pt-8 pb-12 lg:pb-16">
          <SiteTabs active={tab} onChange={selectTab} />
          <div
            role="tabpanel"
            id={panelId(tab)}
            aria-labelledby={tabId(tab)}
            tabIndex={0}
            className="pt-6"
          >
            <p className="mb-6 text-sm text-demo">{DEMO_DATA_SHORT_NOTICE}</p>
            {tab === 'knowledge' ? <KnowledgeTab site={site} /> : <HandoverTab site={site} />}
          </div>
        </div>
      </div>
    </>
  )
}
