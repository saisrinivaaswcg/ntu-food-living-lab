import L from 'leaflet'
import { Minus, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'

/**
 * Zoom buttons as real <button>s with 48px targets (Leaflet's own control uses href="#" links at 30px).
 * Render inside <MapContainer>.
 */
export default function MapZoomControls() {
  const map = useMap()
  const ref = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(() => map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })

  // Clicks and drags on the buttons must not reach the map underneath.
  useEffect(() => {
    if (!ref.current) return
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  const button =
    'flex size-12 items-center justify-center text-ink transition-colors hover:bg-sunken disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover:bg-surface'

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Zoom"
      className="absolute top-3 left-3 z-[500] flex flex-col divide-y divide-line overflow-hidden rounded-sm bg-surface shadow-float"
    >
      <button
        type="button"
        aria-label="Zoom in"
        className={button}
        disabled={zoom >= map.getMaxZoom()}
        onClick={() => map.zoomIn()}
      >
        <Plus className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        className={button}
        disabled={zoom <= map.getMinZoom()}
        onClick={() => map.zoomOut()}
      >
        <Minus className="size-5" aria-hidden />
      </button>
    </div>
  )
}
