import { BarChart3, Table2 } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  /** Rendered when there is data; omit both chart and table to show `empty`. */
  chart: ReactNode
  table: ReactNode
  empty: ReactNode | null
  className?: string
}

/** A chart with a table twin, so every value is readable without hovering. */
export default function ChartCard({ title, subtitle, chart, table, empty, className = '' }: Props) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className={`rounded-card bg-surface p-4 shadow-card lg:p-5 ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 id={headingId} className="font-semibold">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
        </div>
        {!empty && (
          <div className="flex shrink-0 rounded-lg border border-line p-0.5" role="group" aria-label={`${title}: view as`}>
            {(['chart', 'table'] as const).map((v) => {
              const Icon = v === 'chart' ? BarChart3 : Table2
              return (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={`flex min-h-12 min-w-12 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium ${
                    view === v ? 'bg-brand-50 text-brand-800' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  <span className="capitalize">{v}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
      {empty ?? (view === 'chart' ? chart : table)}
    </section>
  )
}
