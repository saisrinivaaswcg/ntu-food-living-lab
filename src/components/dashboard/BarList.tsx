import { motion, useReducedMotion } from 'motion/react'

export interface BarRow {
  key: string
  label: string
  value: number
  /** Text at the bar's end, e.g. "33.1 kg · 56 harvests" */
  display: string
  /** Optional reference mark on the same scale, e.g. a crop's typical days */
  marker?: number
}

interface Props {
  rows: BarRow[]
  /** Accessible summary of the whole chart */
  ariaLabel: string
  /** Which row to highlight; defaults to the largest. Use null for none. */
  highlightKey?: string | null
  /** Legend text for the marker, when rows have one */
  markerLabel?: string
  /** Fixed scale maximum, e.g. 1 for percentages */
  max?: number
}

/**
 * Horizontal bars as plain HTML: labels and values are real text, every bar is labelled directly,
 * one bar is highlighted and the rest are muted. Bars grow in when they scroll into view.
 */
export default function BarList({ rows, ariaLabel, highlightKey, markerLabel, max }: Props) {
  const reduce = useReducedMotion()
  const scaleMax = max ?? Math.max(0, ...rows.flatMap((r) => [r.value, r.marker ?? 0]))
  const top = highlightKey === undefined ? rows.reduce<BarRow | null>((a, r) => (!a || r.value > a.value ? r : a), null)?.key : highlightKey
  const pct = (v: number) => (scaleMax > 0 ? Math.max(0, Math.min(100, (v / scaleMax) * 100)) : 0)

  return (
    <figure aria-label={ariaLabel}>
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.key} className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <span className="truncate text-sm font-medium">{r.label}</span>
            <span className="flex min-w-0 items-center gap-2">
              <span className="relative h-5 min-w-0 flex-1">
                <motion.span
                  className={`absolute inset-y-0 left-0 rounded-r-[2px] ${r.key === top ? 'bg-series-harvest' : 'bg-series-muted'}`}
                  style={{ width: `${pct(r.value)}%`, originX: 0 }}
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                />
                {r.marker !== undefined && (
                  <span
                    className="absolute -inset-y-1 w-0.5 bg-ink"
                    style={{ left: `calc(${pct(r.marker)}% - 1px)` }}
                    title={markerLabel ? `${markerLabel}: ${r.marker}` : undefined}
                    aria-hidden
                  />
                )}
              </span>
              <span className="w-[42%] shrink-0 text-sm tabular-nums sm:w-[38%]">{r.display}</span>
            </span>
          </li>
        ))}
      </ul>
      {markerLabel && (
        <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-5 rounded-r-[2px] bg-series-muted" aria-hidden />
            Observed
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-0.5 bg-ink" aria-hidden />
            {markerLabel}
          </span>
        </figcaption>
      )}
    </figure>
  )
}
