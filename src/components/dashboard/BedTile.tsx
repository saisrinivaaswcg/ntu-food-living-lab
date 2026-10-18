import { formatShortDate } from '../../lib/dates'
import { formatNumber } from '../../lib/format'
import { cropName } from '../../lib/lookups'
import type { BedStatus } from '../../lib/metrics'

/** One bed: its crop, plants alive, and progress towards the first harvest. */
export default function BedTile({ status }: { status: BedStatus }) {
  const { bed, planting } = status
  if (!planting) {
    return (
      <div className="h-full rounded-sm border border-dashed border-line-strong p-3">
        <p className="text-sm text-ink-muted">{bed.label}</p>
        <p className="mt-1 font-semibold text-ink-muted">Nothing growing</p>
      </div>
    )
  }
  return (
    <div className="h-full rounded-sm bg-surface p-3 shadow-card">
      <p className="text-sm text-ink-muted">{bed.label}</p>
      <p className="mt-0.5 font-display text-lg leading-tight font-medium sm:text-xl">{cropName(planting.cropId)}</p>
      <p className="mt-1 text-sm text-ink-muted tabular-nums">
        {formatNumber(status.plantsAlive)} of {formatNumber(planting.quantity)} plants
        <span className="block">Planted {formatShortDate(planting.date)}</span>
      </p>
      <div className="mt-3 h-1.5 bg-brand-100" aria-hidden>
        <div className="h-1.5 bg-brand-700" style={{ width: `${status.growthProgress * 100}%` }} />
      </div>
      <p className="mt-1.5 text-sm">
        {status.firstHarvest
          ? `Harvesting since ${formatShortDate(status.firstHarvest)}`
          : status.expectedFirstHarvest
            ? `First harvest expected ${formatShortDate(status.expectedFirstHarvest)}`
            : 'No typical harvest time recorded'}
      </p>
    </div>
  )
}
