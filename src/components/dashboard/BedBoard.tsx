import { siteName } from '../../lib/lookups'
import type { BedStatus } from '../../lib/metrics'
import type { SiteId } from '../../types'
import Reveal from '../ui/Reveal'
import BedTile from './BedTile'

interface Props {
  sites: { siteId: SiteId; beds: BedStatus[] }[]
}

/** What each bed is growing now, site by site, with progress towards its first harvest. */
export default function BedBoard({ sites }: Props) {
  return (
    <div className="space-y-8">
      {sites.map(({ siteId, beds }) => (
        <section key={siteId} aria-labelledby={`beds-${siteId}`}>
          <h3 id={`beds-${siteId}`} className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-1">
            <span className="font-semibold">{siteName(siteId)}</span>
            <span className="text-sm text-ink-muted tabular-nums">
              {beds.filter((b) => b.planting).length} of {beds.length} beds in use
            </span>
          </h3>
          {beds.length === 0 ? (
            <p className="bg-sunken p-4 text-ink-muted">No beds recorded for this site.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              {beds.map((b, i) => (
                <Reveal as="li" key={b.bed.id} delay={i * 0.03} y={12}>
                  <BedTile status={b} />
                </Reveal>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
