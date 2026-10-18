import { Area, AreaChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import { formatShortDate } from '../../lib/dates'
import { formatCompact, formatNumber } from '../../lib/format'
import type { WeekPoint } from '../../lib/metrics'

interface Props {
  data: WeekPoint[]
  /** Which weekly value to plot. */
  valueKey: 'harvestKg' | 'waterLitres'
  unit: string
  decimals: number
  /** Series colour token, e.g. 'var(--color-series-harvest)' */
  color: string
  /** Short description for screen readers; the table view has every value. */
  ariaLabel: string
  /** What a missing value means, shown in the tooltip (e.g. "No weekly record"). */
  missingLabel?: string
}

// Colours come from the theme tokens in index.css. Labels wear text colours, never the series colour.
const GRID = 'var(--color-line)'
const AXIS_TEXT = 'var(--color-ink-muted)'
const INK = 'var(--color-ink)'
const SURFACE = 'var(--color-canvas)'

interface LabelProps {
  x?: number | string
  y?: number | string
  index?: number
  value?: unknown
}

/**
 * One series over weeks: 2px line, faint area wash, crosshair tooltip. Gaps stay gaps (connectNulls off).
 * Direct labels on the peak and the latest week only, instead of a legend.
 */
export default function WeeklyLineChart({ data, valueKey, unit, decimals, color, ariaLabel, missingLabel }: Props) {
  const values = data.map((d) => d[valueKey])
  let lastIndex = -1
  let peakIndex = -1
  values.forEach((v, i) => {
    if (v === null) return
    lastIndex = i
    if (peakIndex === -1 || v > (values[peakIndex] ?? 0)) peakIndex = i
  })

  const renderLabel = ({ x, y, index, value }: LabelProps) => {
    if (typeof value !== 'number' || (index !== lastIndex && index !== peakIndex)) return null
    const isLast = index === lastIndex
    return (
      <text
        x={Number(x)}
        y={Number(y) - 12}
        textAnchor={isLast ? 'end' : 'middle'}
        fill={INK}
        fontSize={13}
        fontWeight={600}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {`${formatNumber(value, decimals)} ${unit}${isLast && index !== peakIndex ? ' latest' : index === peakIndex ? ' peak' : ''}`}
      </text>
    )
  }

  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const point = active ? (payload?.[0]?.payload as WeekPoint | undefined) : undefined
    if (!point) return null
    const value = point[valueKey]
    return (
      <div className="rounded-sm bg-surface px-3 py-2 text-sm shadow-float">
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
    <div role="img" aria-label={ariaLabel} className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 28, right: 8, bottom: 0, left: 0 }}>
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
            width={40}
          />
          <Tooltip content={renderTooltip} cursor={{ stroke: AXIS_TEXT, strokeWidth: 1 }} />
          <Area
            type="linear"
            dataKey={valueKey}
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill={color}
            fillOpacity={0.08}
            connectNulls={false}
            dot={{ r: 3, fill: color, stroke: SURFACE, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: color, stroke: SURFACE, strokeWidth: 2 }}
            isAnimationActive={false}
          >
            <LabelList dataKey={valueKey} content={renderLabel} />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
