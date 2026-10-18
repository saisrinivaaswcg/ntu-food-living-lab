import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import ExploreHero from '../components/explore/ExploreHero'
import MapLegend from '../components/explore/MapLegend'
import SiteList from '../components/explore/SiteList'
import SiteMap from '../components/explore/SiteMap'
import SitePanel from '../components/explore/SitePanel'
import Reveal from '../components/ui/Reveal'
import { sites } from '../data'
import { usePageTitle } from '../hooks/usePageTitle'
import { findSite } from '../lib/lookups'
import type { SiteId } from '../types'

const MAP_ID = 'map'

export default function ExplorePage() {
  usePageTitle('Explore')
  // The open site lives in the URL (?site=…) so it can be linked and survives Back.
  const [params, setParams] = useSearchParams()
  const selected = findSite(params.get('site') ?? undefined) ?? null
  const selectedIndex = selected ? sites.findIndex((s) => s.id === selected.id) : -1
  const openerRef = useRef<HTMLElement | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const select = useCallback(
    (id: SiteId) => {
      if (document.activeElement instanceof HTMLElement) openerRef.current = document.activeElement
      setParams({ site: id }, { replace: true })
    },
    [setParams],
  )

  // Picking a site from the list below brings the map back into view, so the fly-to can be seen.
  const selectFromList = useCallback(
    (id: SiteId) => {
      select(id)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      mapRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    },
    [select],
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
    <>
      <ExploreHero mapId={MAP_ID} />

      <section id={MAP_ID} aria-labelledby="map-heading" className="scroll-mt-16 pt-14 lg:pt-20">
        <Reveal className="mx-auto max-w-7xl px-4 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-10 lg:px-8">
          <div className="lg:col-span-6">
            <h2 id="map-heading" className="font-display text-section font-medium">
              Where the food grows
            </h2>
            <p className="mt-3 max-w-xl text-lg text-ink-muted">
              Select a marker to see what each site is growing right now. Switch to satellite to see the beds
              themselves.
            </p>
          </div>
          <div className="mt-5 lg:col-span-6 lg:mt-0 lg:flex lg:justify-end">
            <MapLegend />
          </div>
        </Reveal>

        <div ref={mapRef} className="relative mt-8 h-[68svh] min-h-80 scroll-mt-16 bg-sunken lg:h-[min(82vh,48rem)]">
          <SiteMap sites={sites} selectedId={selected?.id ?? null} onSelect={select} />
          <AnimatePresence>
            {selected && <SitePanel key={selected.id} site={selected} index={selectedIndex} onClose={close} />}
          </AnimatePresence>
        </div>
      </section>

      <section aria-labelledby="site-list-heading" className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        <Reveal>
          <h2 id="site-list-heading" className="font-display text-section font-medium">
            The four sites
          </h2>
          <p className="mt-3 mb-8 max-w-xl text-lg text-ink-muted">
            Choose one to find it on the map, then open its page for crop notes and handover records.
          </p>
        </Reveal>
        <SiteList sites={sites} selectedId={selected?.id ?? null} onSelect={selectFromList} />
      </section>
    </>
  )
}
