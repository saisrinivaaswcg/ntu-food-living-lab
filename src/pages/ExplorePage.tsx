import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ExploreHero from '../components/explore/ExploreHero'
import MapLegend from '../components/explore/MapLegend'
import PinEditor from '../components/explore/PinEditor'
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

  // Hidden pin-placement mode: /?editPins=1 makes the pins draggable and shows their coordinates.
  const editPins = params.get('editPins') === '1'
  const [pinOverrides, setPinOverrides] = useState<Partial<Record<SiteId, [number, number]>>>({})
  const mapSites = useMemo(
    () => sites.map((s) => ({ ...s, coordinates: pinOverrides[s.id] ?? s.coordinates })),
    [pinOverrides],
  )
  const movePin = useCallback((id: SiteId, coordinates: [number, number]) => {
    setPinOverrides((prev) => ({ ...prev, [id]: coordinates }))
  }, [])
  // Keep the editing flag when the selected site changes.
  const withMode = useCallback(
    (next: Record<string, string>) => (editPins ? { ...next, editPins: '1' } : next),
    [editPins],
  )

  const selectedBase = findSite(params.get('site') ?? undefined) ?? null
  const selected = selectedBase ? (mapSites.find((s) => s.id === selectedBase.id) ?? null) : null
  const selectedIndex = selected ? sites.findIndex((s) => s.id === selected.id) : -1
  const openerRef = useRef<HTMLElement | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const select = useCallback(
    (id: SiteId) => {
      if (document.activeElement instanceof HTMLElement) openerRef.current = document.activeElement
      setParams(withMode({ site: id }), { replace: true })
    },
    [setParams, withMode],
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
    setParams(withMode({}), { replace: true })
    // Return focus to whatever opened the panel (marker or list button), else to the list entry.
    const opener = openerRef.current
    const fallback = closedId ? document.getElementById(`site-list-${closedId}`) : null
    const target = opener?.isConnected && opener !== document.body ? opener : fallback
    target?.focus({ preventScroll: true })
    openerRef.current = null
  }, [params, setParams, withMode])

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
      {editPins && <PinEditor sites={mapSites} moved={new Set(Object.keys(pinOverrides) as SiteId[])} />}

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
          <SiteMap
            sites={mapSites}
            selectedId={selected?.id ?? null}
            onSelect={select}
            onPinMove={editPins ? movePin : undefined}
          />
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
