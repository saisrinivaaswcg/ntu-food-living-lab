import { formatNumber } from '../../lib/format'
import type { Kpis } from '../../lib/metrics'

interface Tile {
  label: string
  value: string
  unit?: string
  detail?: string
}

export default function KpiTiles({ kpis }: { kpis: Kpis }) {
  const compostShare = kpis.totalKg > 0 ? Math.round((kpis.compostedKg / kpis.totalKg) * 100) : 0
  const tiles: Tile[] = [
    {
      label: 'Total harvest',
      value: formatNumber(kpis.totalKg, 1),
      unit: 'kg',
      detail: kpis.compostedKg > 0 ? `incl. ${formatNumber(kpis.compostedKg, 2)} kg composted (${compostShare}%)` : 'none composted',
    },
    { label: 'Crop types grown', value: String(kpis.cropTypes), detail: 'planted or harvested' },
    { label: 'Water used', value: formatNumber(kpis.waterLitres), unit: 'L', detail: 'from weekly inputs' },
    { label: 'Labour', value: formatNumber(kpis.labourHours, 2), unit: 'h', detail: 'harvest + weekly upkeep' },
    {
      label: 'Harvest per labour hour',
      value: formatNumber(kpis.kgPerLabourHour, 2),
      unit: kpis.kgPerLabourHour === null ? undefined : 'kg/h',
      detail: 'total kg ÷ labour hours',
    },
  ]

  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {tiles.map((t, i) => (
        <li
          key={t.label}
          className={`rounded-card bg-surface p-4 shadow-card ${i === tiles.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}
        >
          <p className="text-sm text-ink-muted">{t.label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight lg:text-3xl">
            {t.value}
            {t.unit && <span className="ml-1 text-base font-medium text-ink-muted">{t.unit}</span>}
          </p>
          {t.detail && <p className="mt-0.5 text-xs text-ink-muted">{t.detail}</p>}
        </li>
      ))}
    </ul>
  )
}
