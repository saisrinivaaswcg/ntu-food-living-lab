import { MousePointerClick } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import MapLegend from '../components/explore/MapLegend'
import SiteList from '../components/explore/SiteList'
import SiteMap from '../components/explore/SiteMap'
import SitePanel from '../components/explore/SitePanel'
import { sites } from '../data'
import { usePageTitle } from '../hooks/usePageTitle'
import { findSite } from '../lib/lookups'
import type { SiteId } from '../types'

export default function ExplorePage() {
  usePageTitle('Explore')
  // The open site lives in the URL (?site=…) so it can be linked and survives Back.
  const [params, setParams] = useSearchParams()
  const selected = findSite(params.get('site') ?? undefined) ?? null
  const openerRef = useRef<HTMLElement | null>(null)

  const select = useCallback(
    (id: SiteId) => {
      if (document.activeElement instanceof HTMLElement) openerRef.current = document.activeElement
      setParams({ site: id }, { replace: true })
    },
    [setParams],
  )

  const close = useCallback(() => {
    const closedId = params.get('site')
    setParams({}, { replace: true })
    // Return focus to whatever opened the panel (marker or list button), else to the list entry.
    const opener = openerRef.current
    const fallback = closedId ? document.getElementById(`site-list-${closedId}`) : null
    const target = opener?.isConnected && opener !== document.body ? opener : fallback
    target?.focus({ preventScroll: true })
    openerRef.current = null
  }, [params, setParams])

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, close])

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-8">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Explore the growing sites</h1>
        <p className="mt-1 max-w-2xl text-ink-muted">
          Four campus food gardens, one shared way of recording what they grow. Pick a site on the map or from the
          list below.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-label="Campus map" className="space-y-2">
          <div className="h-[50dvh] min-h-72 overflow-hidden rounded-card bg-surface shadow-card lg:h-[560px]">
            <SiteMap sites={sites} selectedId={selected?.id ?? null} onSelect={select} />
          </div>
          <MapLegend />
        </section>

        {selected ? (
          <SitePanel key={selected.id} site={selected} onClose={close} />
        ) : (
          <div className="hidden flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-line p-8 text-center text-ink-muted lg:flex lg:h-[560px]">
            <MousePointerClick className="size-8 text-brand-600" aria-hidden />
            <p className="font-medium text-ink">No site selected</p>
            <p className="text-sm">Click a marker on the map, or choose a site from the list, to see its details here.</p>
          </div>
        )}
      </div>

      <section aria-labelledby="site-list-heading" className="mt-8">
        <h2 id="site-list-heading" className="mb-3 text-lg font-semibold">
          All sites
        </h2>
        <SiteList sites={sites} selectedId={selected?.id ?? null} onSelect={select} />
      </section>
    </div>
  )
}
