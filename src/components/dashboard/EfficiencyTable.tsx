import { formatNumber } from '../../lib/format'
import { cropName } from '../../lib/lookups'
import type { CropEfficiency } from '../../lib/metrics'
import EmptyState from '../ui/EmptyState'
import SortableTable, { type Column } from '../ui/SortableTable'

const columns: Column<CropEfficiency>[] = [
  { key: 'crop', label: 'Crop', sortValue: (r) => cropName(r.cropId), render: (r) => cropName(r.cropId) },
  { key: 'kg', label: 'Harvest (kg)', numeric: true, sortValue: (r) => r.kg, render: (r) => formatNumber(r.kg, 2) },
  {
    key: 'water',
    label: 'Water (L)',
    numeric: true,
    sortValue: (r) => r.waterLitres,
    render: (r) => formatNumber(r.waterLitres),
  },
  {
    key: 'labour',
    label: 'Labour (h)',
    numeric: true,
    sortValue: (r) => r.labourHours,
    render: (r) => formatNumber(r.labourHours, 1),
  },
  {
    key: 'kgPerLitre',
    label: 'g per litre',
    numeric: true,
    // Shown in grams: kg-per-litre values are tiny (0.003) and hard to compare.
    sortValue: (r) => r.kgPerLitre,
    render: (r) => formatNumber(r.kgPerLitre === null ? null : r.kgPerLitre * 1000, 1),
  },
  {
    key: 'kgPerHour',
    label: 'kg per labour h',
    numeric: true,
    sortValue: (r) => r.kgPerLabourHour,
    render: (r) => formatNumber(r.kgPerLabourHour, 2),
  },
]

export default function EfficiencyTable({ rows }: { rows: CropEfficiency[] }) {
  return (
    <section aria-labelledby="efficiency-heading" className="rounded-card bg-surface p-4 shadow-card lg:p-5">
      <h2 id="efficiency-heading" className="font-semibold">
        Efficiency by crop
      </h2>
      <p className="mb-3 text-xs text-ink-muted">
        Water and weekly labour are logged per site, then shared across crops by the number of beds each crop
        occupied that week. Harvest labour is counted per crop. Select a column heading to sort.
      </p>
      {rows.length === 0 ? (
        <EmptyState title="No crops in this view" detail="Nothing was harvested or growing for the chosen period and site." />
      ) : (
        <SortableTable
          caption="Efficiency by crop"
          columns={columns}
          rows={rows}
          rowKey={(r) => r.cropId}
          initialSort={{ key: 'kgPerHour', direction: 'desc' }}
        />
      )}
    </section>
  )
}
