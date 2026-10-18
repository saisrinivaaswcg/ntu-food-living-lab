import { useInView } from 'motion/react'
import { useId, useRef, useState, type ReactNode } from 'react'

interface Props {
  title: string
  /** Unit or scope line, e.g. "kg per week" */
  subtitle?: string
  /** "What this shows": one plain sentence under the chart. */
  summary: ReactNode
  /** Where the numbers come from. */
  source: ReactNode
  /** Rendered when there is data; `empty` replaces it. */
  chart: ReactNode
  /** Table twin, so every value is readable without hovering. Omit when the chart's values are already text. */
  table?: ReactNode
  empty: ReactNode | null
  /** Space reserved before the chart mounts, so the page doesn't jump. */
  minHeight?: string
}

/**
 * A chart with an optional table twin, a plain-language summary and a source line. The chart mounts
 * when it scrolls into view, so its entrance animation plays where it can be seen.
 */
export default function ChartFigure({ title, subtitle, summary, source, chart, table, empty, minHeight = '16rem' }: Props) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const headingId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })

  return (
    <figure aria-labelledby={headingId} className="min-w-0">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h3 id={headingId} className="text-lg font-semibold">
            {title}
          </h3>
          {subtitle && <p className="text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {!empty && table && (
          <div className="flex shrink-0 border border-line-strong" role="group" aria-label={`${title}: view as`}>
            {(['chart', 'table'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`min-h-12 min-w-16 px-3 text-sm font-medium capitalize transition-colors ${
                  view === v ? 'bg-ink text-canvas' : 'text-ink-muted hover:bg-sunken hover:text-ink'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>
      <div ref={ref} style={empty || inView ? undefined : { minHeight }}>
        {empty ?? (view === 'table' && table ? table : inView ? chart : null)}
      </div>
      {!empty && (
        <figcaption className="mt-4 border-t border-line pt-3 text-sm">
          <p>
            <span className="font-semibold">What this shows: </span>
            {summary}
          </p>
          <p className="mt-1 text-ink-muted">{source}</p>
        </figcaption>
      )}
    </figure>
  )
}
