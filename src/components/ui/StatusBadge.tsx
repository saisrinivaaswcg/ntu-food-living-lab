import { siteStatusLabels } from '../../data'
import type { SiteStatus } from '../../types'
import { statusDotClass } from './statusStyles'

/** Status as a coloured square and its label (never colour alone). */
export default function StatusBadge({ status, onDark = false }: { status: SiteStatus; onDark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-semibold ${onDark ? 'text-white' : 'text-ink'}`}>
      <span
        className={`size-2.5 rounded-[2px] ${statusDotClass[status]} ${onDark ? 'ring-2 ring-white/80' : ''}`}
        aria-hidden
      />
      {siteStatusLabels[status]}
    </span>
  )
}
