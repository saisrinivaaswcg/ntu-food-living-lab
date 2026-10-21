import L from 'leaflet'
// Leaflet's CSS travels with the map chunk, so pages without a map don't load it.
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { CAMPUS_MAP_VIEW, siteStatusLabels } from '../../data'
import type { Site, SiteId, SiteStatus } from '../../types'
import { statusDotClass } from '../ui/statusStyles'
import MapZoomControls from './MapZoomControls'

/**
 * Two base layers, switched with the Map / Satellite toggle.
 *
 * Map: OneMap Default by the Singapore Land Authority (no API key), HD tiles with a per-tile fallback to the
 * standard tiles. The OneMap logo + credit is required by the OneMap terms of use — do not remove it.
 *
 * Satellite: Esri World Imagery (no key). "Powered by Esri" and the source credit (from the service's own
 * copyrightText) are required by Esri's attribution rules.
 */
const ONEMAP_HD_TILES = 'https://www.onemap.gov.sg/maps/tiles/Default_HD/{z}/{x}/{y}.png'
const onemapFallbackUrl = ({ x, y, z }: L.Coords) => `https://www.onemap.gov.sg/maps/tiles/Default/${z}/${x}/${y}.png`
const ONEMAP_ATTRIBUTION =
  '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" alt="OneMap logo" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'

const ESRI_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const ESRI_ATTRIBUTION =
  'Powered by <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> &#124; Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community'

/** OneMap's documented minimum. */
const MIN_ZOOM = 11
/** Close enough to see individual beds. OneMap HD has tiles to 20; Esri imagery here stops at 19 and is scaled up. */
const MAX_ZOOM = 20
const ONEMAP_HD_MAX_NATIVE = 20
const ESRI_MAX_NATIVE = 19
/** Singapore: south-west and north-east corners (from the OneMap docs) */
const SINGAPORE_BOUNDS = L.latLngBounds([1.144, 103.535], [1.494, 104.502])

type BaseLayer = 'map' | 'satellite'
const BASE_LAYERS: { id: BaseLayer; label: string }[] = [
  { id: 'map', label: 'Map' },
  { id: 'satellite', label: 'Satellite' },
]

/** If an HD tile fails, load the standard OneMap tile in its place (once). */
function fallBackToStandardTile(e: L.TileErrorEvent) {
  const tile = e.tile
  if (tile.dataset.fallback) return
  tile.dataset.fallback = '1'
  tile.src = onemapFallbackUrl(e.coords)
}

interface Props {
  sites: Site[]
  selectedId: SiteId | null
  onSelect: (id: SiteId) => void
  /** Pin-placement mode (/?editPins=1): markers can be dragged. */
  onPinMove?: (id: SiteId, coordinates: [number, number]) => void
  /** Called when the map starts and stops moving (pan, zoom, fly-to). */
  onMovingChange?: (moving: boolean) => void
}

/** Reports when the map is moving, so overlays can drop expensive effects meanwhile. */
function MovementWatcher({ onChange }: { onChange: (moving: boolean) => void }) {
  useMapEvents({ movestart: () => onChange(true), moveend: () => onChange(false) })
  return null
}

/**
 * L.divIcon instead of Leaflet's default image marker (Vite breaks its icon URLs).
 * Colour = site status; the selected site gets a larger marker with a ring. White outline + dark shadow keep
 * markers readable on both the light map and the satellite imagery.
 */
/** Marker tap target, in px (WCAG / Lighthouse target size). */
const MARKER_HIT = 48

function markerIcon(status: SiteStatus, selected: boolean): L.DivIcon {
  // The visible pin is 32px (44px when selected); the tap target around it is always 48px.
  const pin = selected ? 'size-11' : 'size-8'
  const ring = selected ? 'ring-4 ring-white/70' : ''
  return L.divIcon({
    className: 'site-marker',
    iconSize: [MARKER_HIT, MARKER_HIT],
    iconAnchor: [MARKER_HIT / 2, MARKER_HIT / 2],
    html: `<span class="flex size-full items-center justify-center"><span class="flex ${pin} items-center justify-center rounded-full border-[3px] border-white shadow-[0_1px_3px_rgb(0_0_0/0.45),0_4px_12px_rgb(0_0_0/0.35)] ${statusDotClass[status]} ${ring}"><span class="size-2.5 rounded-full bg-white"></span></span></span>`,
  })
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Zoom the map flies to when a site is selected: close enough to see the site's surroundings. */
const SITE_ZOOM = 17

/**
 * Flies to the selected site, whether it was picked on the map or from the list. The detail panel
 * covers part of the map (right side on desktop, bottom sheet on phones), so the site is placed in
 * the middle of the part that stays visible.
 */
function FocusSelected({ site }: { site: Site | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (!site) return
    const zoom = Math.max(map.getZoom(), SITE_ZOOM)
    const size = map.getSize()
    const desktop = window.matchMedia('(min-width: 1024px)').matches
    // Desktop panel: 26rem wide + 1rem gap on the right. Phone sheet: up to 55% of the screen at the bottom.
    const shift = desktop ? L.point(Math.min(size.x / 3, 216), 0) : L.point(0, Math.min(size.y * 0.3, window.innerHeight * 0.27))
    const center = map.unproject(map.project(site.coordinates, zoom).add(shift), zoom)
    if (prefersReducedMotion()) map.setView(center, zoom, { animate: false })
    else map.flyTo(center, zoom, { duration: 1.2 })
  }, [map, site])
  return null
}

export default function SiteMap({ sites, selectedId, onSelect, onPinMove, onMovingChange }: Props) {
  const icons = useMemo(() => {
    const make = (selected: boolean) =>
      Object.fromEntries(
        (Object.keys(siteStatusLabels) as SiteStatus[]).map((s) => [s, markerIcon(s, selected)]),
      ) as Record<SiteStatus, L.DivIcon>
    return { normal: make(false), selected: make(true) }
  }, [])

  const selectedSite = sites.find((s) => s.id === selectedId)
  const [base, setBase] = useState<BaseLayer>('map')

  return (
    <div className="relative size-full">
      <MapContainer
        center={CAMPUS_MAP_VIEW.center}
        zoom={CAMPUS_MAP_VIEW.zoom}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxBounds={SINGAPORE_BOUNDS}
        maxBoundsViscosity={1}
        zoomControl={false}
        scrollWheelZoom={false}
        className="size-full"
        aria-label="Map of the NTU campus showing the growing sites"
      >
        {/* key: swapping layers remounts the TileLayer, which also swaps the attribution. */}
        {base === 'map' ? (
          <TileLayer
            key="onemap"
            url={ONEMAP_HD_TILES}
            attribution={ONEMAP_ATTRIBUTION}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            maxNativeZoom={ONEMAP_HD_MAX_NATIVE}
            eventHandlers={{ tileerror: fallBackToStandardTile }}
          />
        ) : (
          <TileLayer
            key="esri"
            url={ESRI_TILES}
            attribution={ESRI_ATTRIBUTION}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            maxNativeZoom={ESRI_MAX_NATIVE}
          />
        )}
        {sites.map((site) => {
          const selected = site.id === selectedId
          return (
            <Marker
              key={site.id}
              position={site.coordinates}
              icon={(selected ? icons.selected : icons.normal)[site.status]}
              title={`${site.name} — ${siteStatusLabels[site.status]}`}
              alt={site.name}
              zIndexOffset={selected ? 1000 : 0}
              draggable={Boolean(onPinMove)}
              eventHandlers={{
                click: () => onSelect(site.id),
                dragend: (e) => {
                  const { lat, lng } = (e.target as L.Marker).getLatLng()
                  onPinMove?.(site.id, [lat, lng])
                },
              }}
            />
          )
        })}
        <MapZoomControls />
        {onMovingChange && <MovementWatcher onChange={onMovingChange} />}
        <FocusSelected site={selectedSite} />
      </MapContainer>

      <div
        role="group"
        aria-label="Map style"
        className="absolute top-3 left-[4.25rem] z-[500] flex overflow-hidden rounded-sm bg-surface shadow-float"
      >
        {BASE_LAYERS.map((layer) => (
          <button
            key={layer.id}
            type="button"
            aria-pressed={base === layer.id}
            onClick={() => setBase(layer.id)}
            className={`min-h-12 px-4 text-sm font-semibold transition-colors ${
              base === layer.id ? 'bg-ink text-canvas' : 'text-ink hover:bg-sunken'
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>
    </div>
  )
}
