import { Check } from 'lucide-react'
import { formatShortDate } from '../../lib/dates'
import { formatPercent } from '../../lib/format'
import { siteName } from '../../lib/lookups'
import type { Completeness } from '../../lib/metrics'
import type { ISODate } from '../../types'
import EmptyState from '../ui/EmptyState'

interface Props {
  completeness: Completeness
  weeks: ISODate[]
}

/** Per-site breakdown of the completeness score: one square per site-week, filled when logged. */
export default function CompletenessGrid({ completeness, weeks }: Props) {
  if (completeness.bySite.length === 0 || weeks.length === 0) {
    return <EmptyState title="No weeks to score yet" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[20rem] text-sm">
        <caption className="sr-only">Weekly-inputs records per site, last 4 complete weeks</caption>
        <thead>
          <tr className="text-ink-muted">
            <th scope="col" className="pb-3 text-left font-medium">
              Site
            </th>
            {weeks.map((w) => (
              <th key={w} scope="col" className="px-1 pb-3 text-center font-medium whitespace-nowrap">
                <span className="sr-only">Week of </span>
                {formatShortDate(w)}
              </th>
            ))}
            <th scope="col" className="pb-3 pl-3 text-right font-medium">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {completeness.bySite.map((s) => (
            <tr key={s.siteId} className="border-t border-line">
              <th scope="row" className="py-3 pr-3 text-left font-semibold">
                {siteName(s.siteId, true)}
              </th>
              {s.weeks.map((w) => (
                <td key={w.weekStart} className="px-1 py-3 text-center">
                  <span
                    className={`mx-auto flex size-8 items-center justify-center rounded-sm ${
                      w.logged ? 'bg-brand-700 text-white' : 'border-2 border-line-strong'
                    }`}
                  >
                    {w.logged && <Check className="size-4" strokeWidth={2.5} aria-hidden />}
                    <span className="sr-only">{w.logged ? 'Logged' : 'Not logged'}</span>
                  </span>
                </td>
              ))}
              <td className="py-3 pl-3 text-right font-semibold tabular-nums whitespace-nowrap">
                {formatPercent(s.score)}
                <span className="block text-xs font-normal text-ink-muted">
                  {s.logged} of {s.expected}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
        <span className="inline-flex items-center gap-2">
          <span className="flex size-4 items-center justify-center rounded-sm bg-brand-700 text-white" aria-hidden>
            <Check className="size-3" strokeWidth={3} />
          </span>
          Weekly record logged
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-4 rounded-sm border-2 border-line-strong" aria-hidden />
          No record
        </span>
      </p>
    </div>
  )
}
