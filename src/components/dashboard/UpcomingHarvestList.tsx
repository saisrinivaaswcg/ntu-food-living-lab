import { formatShortDate } from '../../lib/dates'
import { cropName, siteName } from '../../lib/lookups'
import type { UpcomingHarvest } from '../../lib/metrics'

function when(daysAway: number): string {
  if (daysAway < 0) return `${-daysAway} ${daysAway === -1 ? 'day' : 'days'} overdue`
  if (daysAway === 0) return 'Due today'
  return `In ${daysAway} ${daysAway === 1 ? 'day' : 'days'}`
}

/** Beds waiting for their first harvest, soonest first. Overdue ones say so in words, not just colour. */
export default function UpcomingHarvestList({ items }: { items: UpcomingHarvest[] }) {
  return (
    <ul className="border-t border-ink">
      {items.map((u) => (
        <li key={u.bed.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
          <span className="min-w-0">
            <span className="block font-semibold">{cropName(u.planting.cropId)}</span>
            <span className="block text-sm text-ink-muted">
              {siteName(u.siteId, true)} · {u.bed.label}
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block font-semibold tabular-nums">{formatShortDate(u.expected)}</span>
            <span className={`block text-sm ${u.daysAway < 0 ? 'font-semibold text-attention' : 'text-ink-muted'}`}>
              {when(u.daysAway)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
