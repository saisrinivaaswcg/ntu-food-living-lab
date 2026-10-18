import { useId, useState, type ReactNode } from 'react'

interface Props {
  title: string
  /** Unit or scope line, e.g. "kg per week" */
  subtitle?: string
  /** "What this shows": one plain sentence under the chart. */
  summary: ReactNode
  /** Where the numbers come from. */
  source: ReactNode
  /** Rendered when there is data; `empty` replaces both. */
  chart: ReactNode
  table: ReactNode
  empty: ReactNode | null
}

/** A chart with a table twin (every value readable without hovering), a plain-language summary and a source line. */
export default function ChartFigure({ title, subtitle, summary, source, chart, table, empty }: Props) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const headingId = useId()

  return (
    <figure aria-labelledby={headingId} className="min-w-0">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h3 id={headingId} className="text-lg font-semibold">
            {title}
          </h3>
          {subtitle && <p className="text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {!empty && (
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
      {empty ?? (view === 'chart' ? chart : table)}
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
