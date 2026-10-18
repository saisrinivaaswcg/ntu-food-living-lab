import CountUp from '../ui/CountUp'

export interface Stat {
  label: string
  /** null shows "—" */
  value: number | null
  format: (n: number) => string
  unit?: string
  detail?: string
}

/** Big headline numbers that count up as they come into view. The first one leads. */
export default function StatRow({ stats }: { stats: Stat[] }) {
  const cols = stats.length >= 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3'
  return (
    <dl className={`grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-0 ${cols}`}>
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`${i === 0 ? 'col-span-2 sm:col-span-1' : ''} sm:border-l sm:border-line sm:px-6 sm:first:border-l-0 sm:first:pl-0`}
        >
          <dt className="text-sm font-medium text-ink-muted">{s.label}</dt>
          <dd className="mt-1">
            {s.value === null ? (
              <span className="font-display text-stat font-medium">—</span>
            ) : (
              <CountUp value={s.value} format={s.format} className="font-display text-stat font-medium tabular-nums" />
            )}
            {s.unit && s.value !== null && <span className="ml-1.5 text-lg text-ink-muted">{s.unit}</span>}
            {s.detail && <span className="mt-1 block text-sm text-ink-muted">{s.detail}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
