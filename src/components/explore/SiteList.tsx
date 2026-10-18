import { MapPin } from 'lucide-react'
import { siteImages } from '../../data'
import type { Site, SiteId } from '../../types'
import Reveal from '../ui/Reveal'
import SlotImage from '../ui/SlotImage'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  sites: Site[]
  selectedId: SiteId | null
  onSelect: (id: SiteId) => void
}

/**
 * The same sites as the map, as buttons — so Explore works without the map.
 * Phones: a swipeable row. Desktop: four across.
 */
export default function SiteList({ sites, selectedId, onSelect }: Props) {
  if (sites.length === 0) {
    return <p className="bg-sunken p-6 text-ink-muted">No sites to show.</p>
  }
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {sites.map((site, i) => {
        const selected = site.id === selectedId
        return (
          <Reveal as="li" key={site.id} delay={i * 0.08} className="w-[80%] shrink-0 snap-start sm:w-auto">
            <button
              type="button"
              id={`site-list-${site.id}`}
              aria-pressed={selected}
              onClick={() => onSelect(site.id)}
              className="group flex h-full w-full flex-col text-left transition-transform duration-300 hover:-translate-y-1 active:translate-y-0 motion-reduce:hover:translate-y-0"
            >
              <span
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded-sm ring-offset-2 ring-offset-canvas ${
                  selected ? 'ring-3 ring-brand-700' : ''
                }`}
              >
                <SlotImage
                  slot={siteImages[site.id]}
                  title={site.shortName}
                  tone={i}
                  zoomOnHover
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
                />
              </span>
              <span className="mt-3 flex items-start justify-between gap-3">
                <span className="font-display text-xl leading-snug font-medium decoration-brand-700 decoration-2 underline-offset-4 group-hover:underline">
                  {site.name}
                </span>
              </span>
              <span className="mt-1">
                <StatusBadge status={site.status} />
              </span>
              <span className="mt-1 flex items-start gap-1.5 text-sm text-ink-muted">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                {site.locationNote}
              </span>
              <span className="mt-1 text-sm text-ink-muted">
                {site.beds.length} beds · {site.areaSqm} m² · {selected ? 'Shown on the map' : 'Show on the map'}
              </span>
            </button>
          </Reveal>
        )
      })}
    </ul>
  )
}
