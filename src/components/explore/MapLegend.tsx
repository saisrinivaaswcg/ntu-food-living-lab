import { siteStatusLabels } from '../../data'
import type { SiteStatus } from '../../types'
import { statusDotClass } from '../ui/statusStyles'

export default function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
      <span className="font-semibold text-ink">Site status:</span>
      {(Object.entries(siteStatusLabels) as [SiteStatus, string][]).map(([status, label]) => (
        <span key={status} className="inline-flex items-center gap-2">
          <span className={`size-3.5 rounded-full border-2 border-white shadow-float ${statusDotClass[status]}`} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  )
}
