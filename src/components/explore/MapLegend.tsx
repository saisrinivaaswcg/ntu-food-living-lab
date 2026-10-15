import { siteStatusLabels } from '../../data'
import type { SiteStatus } from '../../types'
import { statusDotClass } from '../ui/statusStyles'

export default function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
      <span className="font-medium text-ink">Marker colour = site status:</span>
      {(Object.entries(siteStatusLabels) as [SiteStatus, string][]).map(([status, label]) => (
        <span key={status} className="inline-flex items-center gap-1.5">
          <span className={`size-3 rounded-full border-2 border-white shadow-card ${statusDotClass[status]}`} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  )
}
