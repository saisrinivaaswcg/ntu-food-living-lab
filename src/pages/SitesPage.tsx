import { useEffect, useMemo } from 'react'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import SiteRow from '../components/sites/SiteRow'
import Reveal from '../components/ui/Reveal'
import { useLogs } from '../hooks/useLogs'
import { usePageTitle } from '../hooks/usePageTitle'
import { cropsCurrentlyGrowing } from '../lib/metrics'
import { SiteDetailPage } from './lazyPages'

export default function SitesPage() {
  usePageTitle('Sites')
  const { logs, sites } = useLogs()
  const growing = useMemo(() => new Map(sites.map((s) => [s.id, cropsCurrentlyGrowing(logs, s)])), [logs, sites])

  // Load the site page ahead of a click, so opening a site can morph its photo straight into the hero.
  useEffect(() => {
    void SiteDetailPage.preload()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Sites' }]} />
      <Reveal className="max-w-3xl">
        <h1 className="font-display text-display font-medium">Four gardens, one record.</h1>
        <p className="mt-4 text-lg text-ink-muted lg:text-xl">
          Each site keeps its growing knowledge and handover notes here, so they carry over from one committee to the
          next.
        </p>
      </Reveal>
      {sites.length === 0 ? (
        <p className="mt-10 bg-sunken p-6 text-ink-muted">No sites to show.</p>
      ) : (
        <ul className="mt-12 space-y-20 lg:mt-16 lg:space-y-28">
          {sites.map((site, i) => (
            <SiteRow key={site.id} site={site} index={i} growing={growing.get(site.id) ?? []} />
          ))}
        </ul>
      )}
    </div>
  )
}
