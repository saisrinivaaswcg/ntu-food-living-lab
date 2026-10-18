import { Check, Minus } from 'lucide-react'
import { addDays, formatShortDate } from '../../lib/dates'
import { formatPercent } from '../../lib/format'
import { siteName } from '../../lib/lookups'
import type { Completeness } from '../../lib/metrics'
import type { ISODate } from '../../types'
import EmptyState from '../ui/EmptyState'

interface Props {
  completeness: Completeness
  weeks: ISODate[]
}

/** The headline number: share of site-weeks with a weekly-inputs record, last 4 complete weeks. */
export default function CompletenessCard({ completeness, weeks }: Props) {
  // Monday of the first week to Sunday of the last
  const range = weeks.length
    ? `${formatShortDate(weeks[0])} – ${formatShortDate(addDays(weeks[weeks.length - 1], 6))}`
    : ''

  return (
    <section aria-labelledby="completeness-heading" className="rounded-card bg-surface p-5 shadow-card lg:p-6">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div>
          <h2 id="completeness-heading" className="text-sm font-semibold text-ink-muted">
            Data completeness
          </h2>
          {completeness.score === null ? (
            <p className="mt-2 text-ink-muted">No complete weeks yet.</p>
          ) : (
            <>
              <p className="mt-1 text-5xl font-semibold tracking-tight text-ink lg:text-6xl">
                {formatPercent(completeness.score)}
              </p>
              <p className="mt-1 text-sm text-ink">
                of site-weeks logged · {completeness.logged} of {completeness.expected}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                Last 4 complete weeks, {range}
              </p>
            </>
          )}
          <p className="mt-3 text-xs text-ink-muted">
            A week counts when the site has a weekly-inputs record for it. Missing weeks make every other number
            less reliable.
          </p>
        </div>

        {completeness.bySite.length === 0 || weeks.length === 0 ? (
          <EmptyState title="No weeks to score yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Weekly-inputs records per site, last 4 complete weeks</caption>
              <thead>
                <tr className="text-xs text-ink-muted">
                  <th scope="col" className="pb-2 text-left font-medium">
                    Site
                  </th>
                  {weeks.map((w) => (
                    <th key={w} scope="col" className="px-1 pb-2 text-center font-medium whitespace-nowrap">
                      <span className="sr-only">Week of </span>
                      {formatShortDate(w)}
                    </th>
                  ))}
                  <th scope="col" className="pb-2 pl-2 text-right font-medium">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {completeness.bySite.map((s) => (
                  <tr key={s.siteId} className="border-t border-line">
                    <th scope="row" className="py-2 pr-2 text-left font-medium">
                      {siteName(s.siteId, true)}
                    </th>
                    {s.weeks.map((w) => (
                      <td key={w.weekStart} className="px-1 py-2 text-center">
                        <span
                          className={`mx-auto flex size-8 items-center justify-center rounded-lg ${
                            w.logged ? 'bg-brand-600 text-white' : 'border-2 border-dashed border-line text-ink-subtle'
                          }`}
                        >
                          {w.logged ? <Check className="size-4" aria-hidden /> : <Minus className="size-4" aria-hidden />}
                          <span className="sr-only">{w.logged ? 'Logged' : 'Not logged'}</span>
                        </span>
                      </td>
                    ))}
                    <td className="py-2 pl-2 text-right font-semibold tabular-nums whitespace-nowrap">
                      {formatPercent(s.score)}
                      <span className="block text-xs font-normal text-ink-muted">
                        {s.logged}/{s.expected}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
