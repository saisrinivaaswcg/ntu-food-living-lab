import { useReducedMotion } from 'motion/react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import { formatShortDate } from '../../lib/dates'
import { formatNumber } from '../../lib/format'

interface Point {
  weekStart: string
  inProgress: boolean
  [key: string]: string | number | boolean
}

interface Props {
  data: Point[]
  /** Which count to draw as bars */
  valueKey: string
  /** Tooltip line, e.g. (p) => "2 plantings · 60 plants" */
  describe: (point: Point) => string
  ariaLabel: string
}

const COLOR = 'var(--color-series-harvest)'
const GRID = 'var(--color-line)'
const AXIS_TEXT = 'var(--color-ink-muted)'

/** One bar per week, for counts (plantings). Bars grow in on first view. */
export default function WeeklyCountChart({ data, valueKey, describe, ariaLabel }: Props) {
  const reduce = useReducedMotion()

  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const point = active ? (payload?.[0]?.payload as Point | undefined) : undefined
    if (!point) return null
    return (
      <div className="rounded-sm bg-surface px-3 py-2 text-sm shadow-float">
        <p className="font-semibold tabular-nums">{describe(point)}</p>
        <p className="text-xs text-ink-muted">
          Week of {formatShortDate(point.weekStart)}
          {point.inProgress && ' (in progress)'}
        </p>
      </div>
    )
  }

  return (
    <div role="img" aria-label={ariaLabel} className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="20%">
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
            allowDecimals={false}
            tickFormatter={(v: number) => formatNumber(v)}
            tick={{ fill: AXIS_TEXT, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip content={renderTooltip} cursor={{ fill: 'var(--color-sunken)' }} />
          <Bar
            dataKey={valueKey}
            fill={COLOR}
            radius={[2, 2, 0, 0]}
            maxBarSize={28}
            isAnimationActive={!reduce}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
