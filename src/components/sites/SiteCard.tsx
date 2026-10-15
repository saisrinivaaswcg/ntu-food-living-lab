import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Site } from '../../types'
import StatusBadge from '../ui/StatusBadge'

export default function SiteCard({ site }: { site: Site }) {
  return (
    <Link
      to={`/sites/${site.id}`}
      className="flex h-full flex-col gap-3 rounded-card border-2 border-transparent bg-surface p-5 shadow-card transition-colors hover:border-brand-300"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold leading-snug">{site.name}</h2>
        <ArrowRight className="mt-1 size-5 shrink-0 text-brand-700" aria-hidden />
      </div>
      <StatusBadge status={site.status} />
      <p className="text-sm text-ink-muted">{site.description}</p>
      <p className="mt-auto flex items-start gap-1.5 text-sm text-ink-muted">
        <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
        {site.locationNote}
      </p>
      <p className="text-xs text-ink-subtle">
        {site.beds.length} beds · {site.areaSqm} m² · run by {site.managedBy}
      </p>
    </Link>
  )
}
