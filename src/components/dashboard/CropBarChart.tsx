import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import { formatNumber } from '../../lib/format'
import { cropName } from '../../lib/lookups'
import type { CropId } from '../../types'

interface Row {
  cropId: CropId
  kg: number
}

// The largest crop is highlighted; the rest are muted. Values are labelled at each bar tip, so no axis is needed.
const HIGHLIGHT = 'var(--color-series-harvest)'
const MUTED = 'var(--color-series-muted)'
const INK = 'var(--color-ink)'
const ROW_HEIGHT = 36

/** Horizontal bars (crop names stay readable on a phone), sorted largest first. */
export default function CropBarChart({ data }: { data: Row[] }) {
  const rows = data.map((d) => ({ ...d, name: cropName(d.cropId) }))
  const total = data.reduce((a, d) => a + d.kg, 0)
  const maxKg = Math.max(0, ...data.map((d) => d.kg))

  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const row = active ? (payload?.[0]?.payload as (typeof rows)[number] | undefined) : undefined
    if (!row) return null
    return (
      <div className="rounded-sm bg-surface px-3 py-2 text-sm shadow-float">
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
      style={{ height: rows.length * ROW_HEIGHT + 8 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 72, bottom: 0, left: 0 }} barCategoryGap={8}>
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis
            type="category"
            dataKey="name"
            width={92}
            tick={{ fill: INK, fontSize: 14 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={renderTooltip} cursor={{ fill: 'var(--color-sunken)' }} />
          <Bar dataKey="kg" barSize={20} radius={[0, 2, 2, 0]} isAnimationActive={false}>
            {rows.map((r) => (
              <Cell key={r.cropId} fill={r.kg === maxKg ? HIGHLIGHT : MUTED} />
            ))}
            <LabelList
              dataKey="kg"
              position="right"
              formatter={(v: unknown) => (typeof v === 'number' ? `${formatNumber(v, 1)} kg` : '')}
              style={{ fill: INK, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
