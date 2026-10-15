import { formatNumber, formatPercent } from '../../lib/format'
import { siteName } from '../../lib/lookups'
import type { SiteFilter, SiteRow } from '../../lib/metrics'

interface Props {
  rows: SiteRow[]
  highlight: SiteFilter
  completeWeeks: number
}

/** The four sites side by side: one column per site, one row per measure. */
export default function SiteComparison({ rows, highlight, completeWeeks }: Props) {
  const measures: { label: string; value: (r: SiteRow) => string; hint?: string }[] = [
    { label: 'Harvest', value: (r) => `${formatNumber(r.kg, 1)} kg` },
    { label: 'Harvest per m²', value: (r) => `${formatNumber(r.kgPerSqm, 2)} kg` },
    { label: 'Water used', value: (r) => `${formatNumber(r.waterLitres)} L` },
    {
      label: 'Harvest per litre',
      value: (r) => (r.kgPerLitre === null ? '—' : `${formatNumber(r.kgPerLitre * 1000, 1)} g`),
    },
    { label: 'Labour', value: (r) => `${formatNumber(r.labourHours, 1)} h` },
    {
      label: 'Data completeness',
      value: (r) => formatPercent(r.completeness),
      hint: `${completeWeeks} complete ${completeWeeks === 1 ? 'week' : 'weeks'}`,
    },
    { label: 'Survival rate', value: (r) => formatPercent(r.survival) },
  ]

  return (
    <section aria-labelledby="sites-heading" className="rounded-card bg-surface p-4 shadow-card lg:p-5">
      <h2 id="sites-heading" className="font-semibold">
        Site comparison
      </h2>
      <p className="mb-3 text-xs text-ink-muted">
        All four sites for the chosen period{highlight !== 'all' && ' — the selected site is highlighted'}.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="sr-only">Site comparison for the chosen period</caption>
          <thead>
            <tr className="border-b border-line">
              <td />
              {rows.map((r) => (
                <th
                  key={r.siteId}
                  scope="col"
                  className={`px-3 py-2 text-right align-bottom font-semibold ${r.siteId === highlight ? 'rounded-t-lg bg-brand-50' : ''}`}
                >
                  {siteName(r.siteId, true)}
                  {r.siteId === highlight && <span className="block text-xs font-normal text-brand-800">Selected</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {measures.map((m) => (
              <tr key={m.label} className="border-b border-line last:border-0">
                <th scope="row" className="py-2.5 pr-3 text-left font-medium text-ink-muted">
                  {m.label}
                  {m.hint && <span className="block text-xs font-normal">{m.hint}</span>}
                </th>
                {rows.map((r) => (
                  <td
                    key={r.siteId}
                    className={`px-3 py-2.5 text-right tabular-nums ${r.siteId === highlight ? 'bg-brand-50' : ''}`}
                  >
                    {m.value(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
