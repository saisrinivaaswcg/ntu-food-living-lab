import { formatNumber } from '../../lib/format'
import type { Kpis } from '../../lib/metrics'

interface Stat {
  label: string
  value: string
  unit?: string
  detail: string
}

/** The three numbers that matter most, large; the other two KPIs on one line beneath. */
export default function HeadlineNumbers({ kpis }: { kpis: Kpis }) {
  const compostShare = kpis.totalKg > 0 ? Math.round((kpis.compostedKg / kpis.totalKg) * 100) : 0
  const stats: Stat[] = [
    {
      label: 'Harvested',
      value: formatNumber(kpis.totalKg, 1),
      unit: 'kg',
      detail:
        kpis.compostedKg > 0
          ? `Includes ${formatNumber(kpis.compostedKg, 2)} kg composted (${compostShare}%)`
          : 'None composted',
    },
    { label: 'Water used', value: formatNumber(kpis.waterLitres), unit: 'L', detail: 'From weekly input records' },
    {
      label: 'Harvest per labour hour',
      value: formatNumber(kpis.kgPerLabourHour, 2),
      unit: kpis.kgPerLabourHour === null ? undefined : 'kg',
      detail: 'Total kg ÷ harvest and upkeep hours',
    },
  ]

  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line">
        {stats.map((s, i) => (
          <div key={s.label} className={i === 0 ? 'col-span-2 sm:col-span-1 sm:pr-6' : 'sm:px-6'}>
            <dt className="text-sm font-medium text-ink-muted">{s.label}</dt>
            <dd className="mt-1">
              <span className="font-display text-stat font-medium tabular-nums">{s.value}</span>
              {s.unit && <span className="ml-1.5 text-lg text-ink-muted">{s.unit}</span>}
              <span className="mt-1 block text-sm text-ink-muted">{s.detail}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 border-t border-line pt-4 text-ink-muted">
        <span className="font-semibold text-ink tabular-nums">{kpis.cropTypes}</span> crop types planted or harvested ·{' '}
        <span className="font-semibold text-ink tabular-nums">{formatNumber(kpis.labourHours, 1)}</span> labour hours
        (harvest and weekly upkeep)
      </p>
    </div>
  )
}
