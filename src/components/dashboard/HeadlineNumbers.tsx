import { formatNumber } from '../../lib/format'
import type { Kpis } from '../../lib/metrics'
import StatRow from './StatRow'

/** The three numbers that matter most, large and counting up; the other two KPIs on one line beneath. */
export default function HeadlineNumbers({ kpis }: { kpis: Kpis }) {
  const compostShare = kpis.totalKg > 0 ? Math.round((kpis.compostedKg / kpis.totalKg) * 100) : 0
  return (
    <div>
      <StatRow
        stats={[
          {
            label: 'Harvested',
            value: kpis.totalKg,
            format: (n) => formatNumber(n, 1),
            unit: 'kg',
            detail:
              kpis.compostedKg > 0
                ? `Includes ${formatNumber(kpis.compostedKg, 2)} kg composted (${compostShare}%)`
                : 'None composted',
          },
          {
            label: 'Water used',
            value: kpis.waterLitres,
            format: (n) => formatNumber(n),
            unit: 'L',
            detail: 'From weekly input records',
          },
          {
            label: 'Harvest per labour hour',
            value: kpis.kgPerLabourHour,
            format: (n) => formatNumber(n, 2),
            unit: 'kg',
            detail: 'Total kg ÷ harvest and upkeep hours',
          },
        ]}
      />
      <p className="mt-6 border-t border-line pt-4 text-ink-muted">
        <span className="font-semibold text-ink tabular-nums">{kpis.cropTypes}</span> crop types planted or harvested ·{' '}
        <span className="font-semibold text-ink tabular-nums">{formatNumber(kpis.labourHours, 1)}</span> labour hours
        (harvest and weekly upkeep)
      </p>
    </div>
  )
}
