import { compostOptions, costAssumptions, PRICE_SURVEY_DATE, propagationOptions } from '../../data'
import { formatNumber, formatSGD, NO_DATA } from '../../lib/format'
import { cropName } from '../../lib/lookups'
import type { CropCost } from '../../lib/metrics'
import EmptyState from '../ui/EmptyState'
import SortableTable, { type Column } from '../ui/SortableTable'

/** "S$8.15 cheaper" / "S$19.53 more" — the words carry the direction, not colour. */
function Difference({ diff }: { diff: number | null }) {
  if (diff === null) return <span className="text-ink-subtle">{NO_DATA}</span>
  if (Math.abs(diff) < 0.005) return <span>Same</span>
  return (
    <span className={diff < 0 ? 'font-medium text-brand-800' : 'text-ink'}>
      {formatSGD(Math.abs(diff))} {diff < 0 ? 'cheaper' : 'more'}
    </span>
  )
}

const columns: Column<CropCost>[] = [
  { key: 'crop', label: 'Crop', sortValue: (r) => cropName(r.cropId), render: (r) => cropName(r.cropId) },
  { key: 'kg', label: 'Harvest (kg)', numeric: true, sortValue: (r) => r.kg, render: (r) => formatNumber(r.kg, 2) },
  {
    key: 'campus',
    label: 'Campus S$/kg',
    numeric: true,
    sortValue: (r) => r.costPerKg,
    render: (r) => (r.costPerKg === null ? <span className="text-ink-subtle">No harvest</span> : formatSGD(r.costPerKg)),
  },
  {
    key: 'imported',
    label: 'Imported S$/kg',
    numeric: true,
    sortValue: (r) => r.importedPerKg,
    render: (r) => formatSGD(r.importedPerKg),
  },
  {
    key: 'diffImported',
    label: 'vs imported',
    numeric: true,
    sortValue: (r) => r.diffImported,
    render: (r) => <Difference diff={r.diffImported} />,
  },
  {
    key: 'local',
    label: 'Local S$/kg',
    numeric: true,
    sortValue: (r) => r.localPerKg,
    render: (r) => (r.localPerKg === null ? <span className="text-ink-subtle">Not sold</span> : formatSGD(r.localPerKg)),
  },
  {
    key: 'diffLocal',
    label: 'vs local',
    numeric: true,
    sortValue: (r) => r.diffLocal,
    render: (r) => <Difference diff={r.diffLocal} />,
  },
]

export default function CostTable({ rows }: { rows: CropCost[] }) {
  const a = costAssumptions
  return (
    <div>
      {rows.length === 0 ? (
        <EmptyState title="No crops in this view" detail="Nothing was harvested or growing for the chosen period and site." />
      ) : (
        <SortableTable
          caption="Cost per kilogram by crop, campus compared with supermarket prices"
          columns={columns}
          rows={rows}
          rowKey={(r) => r.cropId}
          initialSort={{ key: 'crop', direction: 'asc' }}
        />
      )}

      {/* Shown, not hidden behind a click: the comparison only means something with its assumptions. */}
      <div className="mt-6 bg-sunken p-4 text-sm lg:p-5">
        <h3 className="font-semibold">Assumptions and price survey</h3>
        <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="text-ink-muted">Supermarket prices surveyed</dt>
            <dd>{PRICE_SURVEY_DATE} — demonstration figures</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Water</dt>
            <dd>S${a.waterPerLitre} per litre</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Compost</dt>
            <dd>
              {compostOptions
                .filter((c) => c.value !== 'none')
                .map((c) => `${c.label}: ${a.compostPerKg[c.value] === 0 ? 'free' : `${formatSGD(a.compostPerKg[c.value])}/kg`}`)
                .join(' · ')}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">Propagation, per unit</dt>
            <dd>
              {propagationOptions
                .map((p) => `${p.label}: ${a.propagationPerUnit[p.value] === 0 ? 'free' : formatSGD(a.propagationPerUnit[p.value])}`)
                .join(' · ')}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">Labour</dt>
            <dd>{a.labourPerHour === 0 ? 'S$0 per hour (volunteers)' : `${formatSGD(a.labourPerHour)} per hour`}</dd>
          </div>
        </dl>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-muted">
          {a.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
