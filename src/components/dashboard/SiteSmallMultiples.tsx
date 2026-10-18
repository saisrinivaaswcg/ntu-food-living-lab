import { useReducedMotion } from 'motion/react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import { formatShortDate } from '../../lib/dates'
import { formatNumber } from '../../lib/format'
import { siteName } from '../../lib/lookups'
import type { SiteWeeklyHarvest } from '../../lib/metrics'

const COLOR = 'var(--color-series-harvest)'
const AXIS_TEXT = 'var(--color-ink-muted)'
const GRID = 'var(--color-line)'

type Point = SiteWeeklyHarvest['points'][number]

/**
 * Kg per week, one small chart per site on a shared scale, instead of four coloured lines on one
 * chart: each site reads on its own, and the shared y-axis keeps them comparable.
 */
export default function SiteSmallMultiples({ series }: { series: SiteWeeklyHarvest[] }) {
  const reduce = useReducedMotion()
  const maxKg = Math.max(0.1, ...series.flatMap((s) => s.points.map((p) => p.kg)))
  const grandTotal = series.reduce((a, s) => a + s.totalKg, 0)

  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const point = active ? (payload?.[0]?.payload as Point | undefined) : undefined
    if (!point) return null
    return (
      <div className="rounded-sm bg-surface px-3 py-2 text-sm shadow-float">
        <p className="font-semibold tabular-nums">{formatNumber(point.kg, 2)} kg</p>
        <p className="text-xs text-ink-muted">
          Week of {formatShortDate(point.weekStart)}
          {point.inProgress && ' (in progress)'}
        </p>
      </div>
    )
  }

  return (
    <ul className={`grid gap-x-8 gap-y-8 ${series.length > 1 ? 'sm:grid-cols-2' : ''}`}>
      {series.map((s) => (
        <li key={s.siteId} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 border-b border-line pb-1">
            <span className="truncate font-semibold">{siteName(s.siteId, true)}</span>
            <span className="shrink-0 text-sm tabular-nums">
              <span className="font-semibold">{formatNumber(s.totalKg, 1)} kg</span>
              {series.length > 1 && grandTotal > 0 && (
                <span className="text-ink-muted"> · {Math.round((s.totalKg / grandTotal) * 100)}%</span>
              )}
            </span>
          </div>
          <div
            role="img"
            aria-label={`${siteName(s.siteId)}: ${formatNumber(s.totalKg, 1)} kg over ${s.points.length} weeks.`}
            className="h-32"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s.points} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="weekStart"
                  tickFormatter={formatShortDate}
                  tick={{ fill: AXIS_TEXT, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: GRID }}
                  minTickGap={40}
                />
                <YAxis domain={[0, maxKg]} hide />
                <Tooltip content={renderTooltip} cursor={{ stroke: AXIS_TEXT, strokeWidth: 1 }} />
                <Area
                  type="linear"
                  dataKey="kg"
                  stroke={COLOR}
                  strokeWidth={2}
                  fill={COLOR}
                  fillOpacity={0.1}
                  dot={false}
                  activeDot={{ r: 5, fill: COLOR, stroke: 'var(--color-canvas)', strokeWidth: 2 }}
                  isAnimationActive={!reduce}
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </li>
      ))}
    </ul>
  )
}
