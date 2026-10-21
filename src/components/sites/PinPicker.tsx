import L from 'leaflet'
// Its own lazy chunk, so it brings Leaflet's CSS with it (shared with the Explore map chunk).
import 'leaflet/dist/leaflet.css'
import { useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { CAMPUS_MAP_VIEW } from '../../data'
import { fallBackToStandardTile, MAX_ZOOM, MIN_ZOOM, ONEMAP_ATTRIBUTION, ONEMAP_HD_MAX_NATIVE, ONEMAP_HD_TILES, SINGAPORE_BOUNDS } from '../explore/mapTiles'

interface Props {
  value: [number, number] | null
  onChange: (coordinates: [number, number]) => void
}

const round = (n: number) => Math.round(n * 1e6) / 1e6

function ClickToPlace({ onChange }: { onChange: Props['onChange'] }) {
  useMapEvents({ click: (e) => onChange([round(e.latlng.lat), round(e.latlng.lng)]) })
  return null
}

/** Tap the map to drop the garden's pin; drag it to adjust. OneMap tiles, with the required credit. */
export default function PinPicker({ value, onChange }: Props) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: 'site-marker',
        html: '<span style="display:block;width:22px;height:22px;border-radius:9999px;background:var(--color-accent);border:3px solid var(--color-surface);box-shadow:0 1px 4px rgb(0 0 0 / .4)"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    [],
  )
  return (
    <div className="h-72 overflow-hidden rounded-sm border border-line-strong sm:h-96">
      <MapContainer
        center={value ?? CAMPUS_MAP_VIEW.center}
        zoom={CAMPUS_MAP_VIEW.zoom + 1}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxBounds={SINGAPORE_BOUNDS}
        className="size-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          url={ONEMAP_HD_TILES}
          attribution={ONEMAP_ATTRIBUTION}
          maxNativeZoom={ONEMAP_HD_MAX_NATIVE}
          maxZoom={MAX_ZOOM}
          eventHandlers={{ tileerror: fallBackToStandardTile }}
        />
        <ClickToPlace onChange={onChange} />
        {value && (
          <Marker
            position={value}
            icon={icon}
            draggable
            keyboard={false}
            eventHandlers={{
              dragend: (e) => {
                const p = (e.target as L.Marker).getLatLng()
                onChange([round(p.lat), round(p.lng)])
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
