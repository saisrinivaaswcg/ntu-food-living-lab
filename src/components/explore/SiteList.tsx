import { ChevronRight } from 'lucide-react'
import type { Site, SiteId } from '../../types'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  sites: Site[]
  selectedId: SiteId | null
  onSelect: (id: SiteId) => void
}

/** The same sites as the map, as plain buttons — so Explore works without the map. */
export default function SiteList({ sites, selectedId, onSelect }: Props) {
  if (sites.length === 0) {
    return <p className="rounded-card bg-surface p-6 text-sm text-ink-muted shadow-card">No sites to show.</p>
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {sites.map((site) => {
        const selected = site.id === selectedId
        return (
          <li key={site.id}>
            <button
              type="button"
              id={`site-list-${site.id}`}
              aria-pressed={selected}
              onClick={() => onSelect(site.id)}
              className={`flex h-full min-h-12 w-full flex-col items-start gap-2 rounded-card border-2 bg-surface p-4 text-left shadow-card transition-colors hover:border-brand-300 ${
                selected ? 'border-brand-600' : 'border-transparent'
              }`}
            >
              <span className="flex w-full items-start justify-between gap-2">
                <span className="font-semibold leading-snug">{site.name}</span>
                <ChevronRight className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden />
              </span>
              <StatusBadge status={site.status} />
              <span className="text-sm text-ink-muted">{site.locationNote}</span>
              <span className="text-xs text-ink-subtle">
                {site.beds.length} beds · {site.areaSqm} m²
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
