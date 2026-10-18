import { addDays, formatShortDate } from '../../lib/dates'
import { formatPercent } from '../../lib/format'
import type { Completeness } from '../../lib/metrics'
import type { ISODate } from '../../types'

interface Props {
  completeness: Completeness
  weeks: ISODate[]
  /** id of the per-site breakdown further down the page */
  breakdownId: string
}

/** The headline completeness score, said as a sentence. Sits in the dashboard hero. */
export default function CompletenessSummary({ completeness, weeks, breakdownId }: Props) {
  const range = weeks.length ? `${formatShortDate(weeks[0])} – ${formatShortDate(addDays(weeks[weeks.length - 1], 6))}` : ''
  return (
    <section aria-labelledby="completeness-heading" className="border-t-4 border-accent bg-surface p-5 lg:p-6">
      <h2 id="completeness-heading" className="text-sm font-semibold text-ink-muted">
        Data completeness
      </h2>
      {completeness.score === null ? (
        <p className="mt-2 font-display text-2xl">No complete weeks to score yet.</p>
      ) : (
        <>
          <p className="mt-1 font-display text-stat font-medium text-accent-strong tabular-nums">
            {formatPercent(completeness.score)}
          </p>
          <p className="mt-2 font-display text-xl leading-snug">
            {completeness.logged} of {completeness.expected} site-weeks have a weekly record in the last 4 complete weeks
            ({range}).
          </p>
        </>
      )}
      <p className="mt-3 text-sm text-ink-muted">Missing weeks make every other number less reliable.</p>
      <a
        href={`#${breakdownId}`}
        className="mt-1 inline-flex min-h-12 items-center text-sm font-semibold text-ink underline underline-offset-4 hover:text-brand-700"
      >
        See each site’s weeks
      </a>
    </section>
  )
}
