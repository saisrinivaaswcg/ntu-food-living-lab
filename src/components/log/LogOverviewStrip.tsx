import type { LogOverview } from '../../lib/metrics'

/** Big numbers for the Log page: what is growing, what is ready, when the last harvest was. */
export default function LogOverviewStrip({ overview }: { overview: LogOverview }) {
  const last = overview.lastHarvestDaysAgo
  const items = [
    { value: String(overview.growing), label: overview.growing === 1 ? 'planting growing' : 'plantings growing' },
    { value: String(overview.readyThisWeek), label: 'ready to harvest this week' },
    {
      value: last === null ? '—' : last === 0 ? 'Today' : `${last} ${last === 1 ? 'day' : 'days'}`,
      label: last === null ? 'no harvests yet' : last === 0 ? 'last harvest' : 'since the last harvest',
    },
  ]
  return (
    <dl className="grid grid-cols-3 divide-x divide-line border-y border-line py-4">
      {items.map((i, k) => (
        <div key={i.label} className={k === 0 ? 'pr-3' : 'px-3'}>
          <dt className="sr-only">{i.label}</dt>
          <dd>
            <span className="block font-display text-3xl font-medium tabular-nums sm:text-5xl">{i.value}</span>
            <span className="text-sm text-ink-muted" aria-hidden>
              {i.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  )
}
