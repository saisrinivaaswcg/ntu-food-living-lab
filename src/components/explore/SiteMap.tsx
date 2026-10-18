import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { CAMPUS_MAP_VIEW, siteStatusLabels } from '../../data'
import type { Site, SiteId, SiteStatus } from '../../types'
import { statusDotClass } from '../ui/statusStyles'

/**
 * Basemap: OneMap by the Singapore Land Authority (no API key needed).
 * Zoom limits, bounds and attribution follow onemap.gov.sg/docs/maps. The attribution
 * (OneMap logo + credit) is required by the OneMap terms of use — do not remove it.
 */
const ONEMAP_TILES = 'https://www.onemap.gov.sg/maps/tiles/GreyLite/{z}/{x}/{y}.png'
const ONEMAP_ATTRIBUTION =
  '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
const ONEMAP_MIN_ZOOM = 11
const ONEMAP_MAX_ZOOM = 19
/** Singapore: south-west and north-east corners */
const SINGAPORE_BOUNDS = L.latLngBounds([1.144, 103.535], [1.494, 104.502])

interface Props {
  sites: Site[]
  selectedId: SiteId | null
  onSelect: (id: SiteId) => void
}

/**
 * L.divIcon instead of Leaflet's default image marker (Vite breaks its icon URLs).
 * Colour = site status; the selected site gets a larger marker with a ring.
 */
function markerIcon(status: SiteStatus, selected: boolean): L.DivIcon {
  const size = selected ? 40 : 30
  const ring = selected ? 'ring-4 ring-brand-900/30' : ''
  return L.divIcon({
    className: 'site-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="flex size-full items-center justify-center rounded-full border-[3px] border-white shadow-card ${statusDotClass[status]} ${ring}"><span class="size-2.5 rounded-full bg-white"></span></span>`,
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

  return (
    <MapContainer
      center={CAMPUS_MAP_VIEW.center}
      zoom={CAMPUS_MAP_VIEW.zoom}
      minZoom={ONEMAP_MIN_ZOOM}
      maxZoom={ONEMAP_MAX_ZOOM}
      maxBounds={SINGAPORE_BOUNDS}
      maxBoundsViscosity={1}
      scrollWheelZoom={false}
      className="size-full"
      aria-label="Map of the NTU campus showing the four growing sites"
    >
      <TileLayer
        url={ONEMAP_TILES}
        attribution={ONEMAP_ATTRIBUTION}
        detectRetina
        minZoom={ONEMAP_MIN_ZOOM}
        maxZoom={ONEMAP_MAX_ZOOM}
      />
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
  )
}
