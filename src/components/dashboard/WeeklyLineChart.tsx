import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import { formatShortDate } from '../../lib/dates'
import { formatCompact, formatNumber } from '../../lib/format'
import type { WeekPoint } from '../../lib/metrics'

interface Props {
  data: WeekPoint[]
  /** Which weekly value to plot. */
  valueKey: 'harvestKg' | 'waterLitres'
  unit: string
  decimals: number
  /** Short description for screen readers; the table view has every value. */
  ariaLabel: string
  /** What a missing value means, shown in the tooltip (e.g. "No weekly record"). */
  missingLabel?: string
}

// Colours come from the theme tokens in index.css.
const SERIES = 'var(--color-brand-600)'
const GRID = 'var(--color-line)'
const AXIS_TEXT = 'var(--color-ink-muted)'
const SURFACE = 'var(--color-surface)'

/** One series over weeks: 2px line, light area wash, crosshair tooltip. Gaps stay gaps (connectNulls off). */
export default function WeeklyLineChart({ data, valueKey, unit, decimals, ariaLabel, missingLabel }: Props) {
  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const point = active ? (payload?.[0]?.payload as WeekPoint | undefined) : undefined
    if (!point) return null
    const value = point[valueKey]
    return (
      <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-card">
        <p className="font-semibold tabular-nums">
          {value === null ? (missingLabel ?? 'No data') : `${formatNumber(value, decimals)} ${unit}`}
        </p>
        <p className="text-xs text-ink-muted">
          Week of {formatShortDate(point.weekStart)}
          {point.inProgress && ' (in progress)'}
        </p>
      </div>
    )
  }

  return (
    <div role="img" aria-label={ariaLabel} className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} strokeWidth={1} />
          <XAxis
            dataKey="weekStart"
            tickFormatter={formatShortDate}
            tick={{ fill: AXIS_TEXT, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={formatCompact}
            tick={{ fill: AXIS_TEXT, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip content={renderTooltip} cursor={{ stroke: AXIS_TEXT, strokeWidth: 1 }} />
          <Area
            type="linear"
            dataKey={valueKey}
            stroke={SERIES}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill={SERIES}
            fillOpacity={0.1}
            connectNulls={false}
            dot={{ r: 4, fill: SERIES, stroke: SURFACE, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: SERIES, stroke: SURFACE, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
