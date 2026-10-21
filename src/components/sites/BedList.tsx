import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLogs } from '../../hooks/useLogs'
import { formatDate, todayISO } from '../../lib/dates'
import { cropName } from '../../lib/lookups'
import { bedStatuses, latestLogDate } from '../../lib/metrics'
import { paths } from '../../lib/paths'
import type { Site } from '../../types'

/** Every bed at a site with its area and what is growing in it now. */
export default function BedList({ site }: { site: Site }) {
  const { logs } = useLogs()
  const beds = useMemo(() => bedStatuses(logs, site, latestLogDate(logs) ?? todayISO()), [logs, site])

  if (beds.length === 0) return <p className="mt-4 bg-sunken p-4 text-ink-muted">No beds recorded for this site.</p>

  return (
    <ul className="mt-4 border-t border-ink">
      {beds.map(({ bed, planting, plantsAlive }) => (
        <li key={bed.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line py-1.5 sm:py-3">
          <span>
            <Link to={paths.bed(site.id, bed.id)} className="inline-flex min-h-12 items-center font-semibold underline-offset-4 hover:underline sm:min-h-0">
              {bed.label}
            </Link>
            <span className="text-sm text-ink-muted"> · {bed.areaSqm} m²</span>
          </span>
          <span className={planting ? 'text-ink' : 'text-ink-muted'}>
            {planting ? (
              <>
                {cropName(planting.cropId)} · <span className="tabular-nums">{plantsAlive}</span> plants
                <span className="text-ink-muted">
                  {' '}
                  · {planting.source === 'setup' ? 'set by hand' : `planted ${formatDate(planting.date)}`}
                </span>
              </>
            ) : (
              'Nothing growing'
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}
