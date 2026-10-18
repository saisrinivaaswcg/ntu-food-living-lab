import { formatNumber, formatPercent } from '../../lib/format'
import { siteName } from '../../lib/lookups'
import {
  LEADERBOARD_COMPONENTS,
  LEADERBOARD_WEIGHTS,
  type LeaderboardComponent,
  type LeaderboardEntry,
  type SiteFilter,
} from '../../lib/metrics'

function rawValue(key: LeaderboardComponent, value: number | null): string {
  if (value === null) return 'no data'
  switch (key) {
    case 'yield':
      return `${formatNumber(value, 2)} kg/m²`
    case 'completeness':
    case 'survival':
      return formatPercent(value)
    case 'waterEfficiency':
      return `${formatNumber(value * 1000, 1)} g/L`
  }
}

interface Props {
  entries: LeaderboardEntry[]
  highlight: SiteFilter
}

// Rank · site and score · four components. On large screens the component labels move into a header row.
const ROW_GRID = 'lg:grid lg:grid-cols-[3rem_minmax(0,2fr)_repeat(4,minmax(0,1fr))] lg:gap-x-6'

/** Ranks sites on a blended score, showing every component so the ranking is transparent. */
export default function Leaderboard({ entries, highlight }: Props) {
  const weightTotal = Object.values(LEADERBOARD_WEIGHTS).reduce((a, b) => a + b, 0)
  const weightPct = (k: LeaderboardComponent) => Math.round((LEADERBOARD_WEIGHTS[k] / weightTotal) * 100)

  return (
    <div>
      <div className={`hidden border-b border-ink pb-2 text-sm text-ink-muted ${ROW_GRID}`} aria-hidden>
        <span>Rank</span>
        <span>Site and blended score</span>
        {LEADERBOARD_COMPONENTS.map((c) => (
          <span key={c.key} className="text-right">
            {c.label} ({weightPct(c.key)}%)
          </span>
        ))}
      </div>
      <ol>
        {entries.map((e) => {
          const selected = e.siteId === highlight
          return (
            <li
              key={e.siteId}
              className={`border-b border-line py-4 lg:items-center ${ROW_GRID} ${selected ? 'bg-brand-50' : ''}`}
            >
              <div className="flex items-baseline gap-3 lg:contents">
                <span className="font-display text-3xl font-medium tabular-nums lg:pl-1">
                  <span className="sr-only">Rank </span>
                  {e.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">
                      {siteName(e.siteId)}
                      {selected && <span className="ml-2 text-sm font-normal text-brand-800">Selected</span>}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      <span className="font-display text-2xl font-medium">{formatNumber(e.score, 0)}</span>
                      <span className="text-sm text-ink-muted"> / 100</span>
                    </span>
                  </div>
                  {/* Score meter: a lighter step of the same hue for the track. */}
                  <div className="mt-2 h-1.5 bg-brand-100" aria-hidden>
                    <div className="h-1.5 bg-brand-700" style={{ width: `${Math.max(0, Math.min(100, e.score))}%` }} />
                  </div>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4 lg:contents">
                {LEADERBOARD_COMPONENTS.map((c) => {
                  const comp = e.components[c.key]
                  return (
                    <div key={c.key} className="lg:text-right">
                      <dt className="text-sm text-ink-muted lg:sr-only">
                        {c.label} ({weightPct(c.key)}%)
                      </dt>
                      <dd className="tabular-nums">
                        <span className="font-semibold">{formatNumber(comp.scaled, 0)}</span>
                        <span className="block text-sm text-ink-muted">{rawValue(c.key, comp.value)}</span>
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
