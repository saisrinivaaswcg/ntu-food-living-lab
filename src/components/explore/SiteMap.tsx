import L from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { CAMPUS_MAP_VIEW, siteStatusLabels } from '../../data'
import type { Site, SiteId, SiteStatus } from '../../types'
import { statusDotClass } from '../ui/statusStyles'

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
  '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'

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
}

/**
 * L.divIcon instead of Leaflet's default image marker (Vite breaks its icon URLs).
 * Colour = site status; the selected site gets a larger marker with a ring. White outline + dark shadow keep
 * markers readable on both the light map and the satellite imagery.
 */
function markerIcon(status: SiteStatus, selected: boolean): L.DivIcon {
  const size = selected ? 44 : 32
  const ring = selected ? 'ring-4 ring-white/70' : ''
  return L.divIcon({
    className: 'site-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="flex size-full items-center justify-center rounded-full border-[3px] border-white shadow-[0_1px_3px_rgb(0_0_0/0.45),0_4px_12px_rgb(0_0_0/0.35)] ${statusDotClass[status]} ${ring}"><span class="size-2.5 rounded-full bg-white"></span></span>`,
  })
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Pans to the selected site, whether it was picked on the map or from the list. */
function FocusSelected({ site }: { site: Site | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (!site) return
    const zoom = Math.max(map.getZoom(), 16)
    if (prefersReducedMotion()) map.setView(site.coordinates, zoom, { animate: false })
    else map.flyTo(site.coordinates, zoom, { duration: 0.6 })
  }, [map, site])
  return null
}

export default function SiteMap({ sites, selectedId, onSelect }: Props) {
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
        scrollWheelZoom={false}
        className="size-full"
        aria-label="Map of the NTU campus showing the four growing sites"
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
              eventHandlers={{ click: () => onSelect(site.id) }}
            />
          )
        })}
        <FocusSelected site={selectedSite} />
      </MapContainer>

      <div
        role="group"
        aria-label="Map style"
        className="absolute top-3 right-3 z-[500] flex overflow-hidden rounded-sm bg-surface shadow-float"
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
