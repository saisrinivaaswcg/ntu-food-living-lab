import { siteStatusLabels } from '../../data'
import type { SiteStatus } from '../../types'
import { statusBadgeClass, statusDotClass } from './statusStyles'

export default function StatusBadge({ status }: { status: SiteStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass[status]}`}
    >
      <span className={`size-2 rounded-full ${statusDotClass[status]}`} aria-hidden />
      {siteStatusLabels[status]}
    </span>
  )
}
