import { Trophy } from 'lucide-react'
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

/** Ranks sites on a blended score, showing every component so the ranking is transparent. */
export default function Leaderboard({ entries, highlight }: Props) {
  const weightTotal = Object.values(LEADERBOARD_WEIGHTS).reduce((a, b) => a + b, 0)
  const weightPct = (k: LeaderboardComponent) => Math.round((LEADERBOARD_WEIGHTS[k] / weightTotal) * 100)

  return (
    <section aria-labelledby="leaderboard-heading" className="rounded-card bg-surface p-4 shadow-card lg:p-5">
      <h2 id="leaderboard-heading" className="flex items-center gap-2 font-semibold">
        <Trophy className="size-5 text-brand-700" aria-hidden />
        Inter-hall challenge
      </h2>
      <p className="mb-3 text-xs text-ink-muted">
        Not yield alone. Each measure is scored 0–100 against the best site, then blended:{' '}
        {LEADERBOARD_COMPONENTS.map((c) => `${c.label.toLowerCase()} ${weightPct(c.key)}%`).join(', ')}. Yield is per m²,
        so small sites aren’t penalised.
      </p>
      <ol className="space-y-3">
        {entries.map((e) => (
          <li
            key={e.siteId}
            className={`rounded-xl border p-3 ${e.siteId === highlight ? 'border-brand-600 bg-brand-50' : 'border-line'}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  e.rank === 1 ? 'bg-brand-700 text-white' : 'bg-canvas text-ink'
                }`}
                aria-label={`Rank ${e.rank}`}
              >
                {e.rank}
              </span>
              <span className="min-w-0 flex-1 font-semibold">{siteName(e.siteId)}</span>
              <span className="text-2xl font-semibold">
                {formatNumber(e.score, 0)}
                <span className="text-sm font-normal text-ink-muted"> / 100</span>
              </span>
            </div>
            {/* Score meter: the track is a lighter step of the same hue. */}
            <div className="mt-2 h-2 rounded-full bg-brand-100" aria-hidden>
              <div className="h-2 rounded-full bg-brand-600" style={{ width: `${Math.max(0, Math.min(100, e.score))}%` }} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {LEADERBOARD_COMPONENTS.map((c) => {
                const comp = e.components[c.key]
                return (
                  <div key={c.key} className="rounded-lg bg-surface px-2.5 py-2 ring-1 ring-line">
                    <dt className="text-xs text-ink-muted">
                      {c.label} <span className="whitespace-nowrap">({weightPct(c.key)}%)</span>
                    </dt>
                    <dd>
                      <span className="font-semibold tabular-nums">{formatNumber(comp.scaled, 0)}</span>
                      <span className="text-xs text-ink-muted"> /100 · {rawValue(c.key, comp.value)}</span>
                    </dd>
                  </div>
                )
              })}
            </dl>
          </li>
        ))}
      </ol>
    </section>
  )
}
