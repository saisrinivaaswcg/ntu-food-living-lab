import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import { formatCompact, formatNumber } from '../../lib/format'
import { cropName } from '../../lib/lookups'
import type { CropId } from '../../types'

interface Row {
  cropId: CropId
  kg: number
}

const SERIES = 'var(--color-brand-600)'
const GRID = 'var(--color-line)'
const AXIS_TEXT = 'var(--color-ink-muted)'
const INK = 'var(--color-ink)'
const ROW_HEIGHT = 36

/** Horizontal bars (crop names stay readable on a phone), one colour, value at the bar tip. */
export default function CropBarChart({ data }: { data: Row[] }) {
  const rows = data.map((d) => ({ ...d, name: cropName(d.cropId) }))
  const total = data.reduce((a, d) => a + d.kg, 0)

  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const row = active ? (payload?.[0]?.payload as (typeof rows)[number] | undefined) : undefined
    if (!row) return null
    return (
      <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-card">
        <p className="font-semibold tabular-nums">{formatNumber(row.kg, 2)} kg</p>
        <p className="text-xs text-ink-muted">
          {row.name} · {total > 0 ? Math.round((row.kg / total) * 100) : 0}% of harvest
        </p>
      </div>
    )
  }

  return (
    <div
      role="img"
      aria-label={`Harvest by crop. Largest: ${rows[0]?.name ?? 'none'}, ${formatNumber(rows[0]?.kg ?? 0, 1)} kg.`}
      style={{ height: rows.length * ROW_HEIGHT + 32 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }} barCategoryGap={8}>
          <CartesianGrid horizontal={false} stroke={GRID} strokeWidth={1} />
          <XAxis
            type="number"
            tickFormatter={formatCompact}
            tick={{ fill: AXIS_TEXT, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={88}
            tick={{ fill: INK, fontSize: 13 }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
          />
          <Tooltip content={renderTooltip} cursor={{ fill: 'var(--color-brand-50)' }} />
          <Bar dataKey="kg" fill={SERIES} barSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList
              dataKey="kg"
              position="right"
              formatter={(v: unknown) => (typeof v === 'number' ? formatNumber(v, 1) : '')}
              style={{ fill: INK, fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
