import { ArrowRight, Info, Sparkles, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import EmptyState from '../components/ui/EmptyState'
import Reveal from '../components/ui/Reveal'
import { CUP_SEMESTER, DEMO_DATA_SHORT_NOTICE, spotlightChallenges } from '../data'
import { useCommunity } from '../hooks/useCommunity'
import { useLogs } from '../hooks/useLogs'
import { usePageTitle } from '../hooks/usePageTitle'
import { anchorDate, CUP_COMPONENTS, HALL_CUP_WEIGHTS, hallCupRanking, isHallSite, spotlightStandings, type CupComponent } from '../lib/metrics'
import { formatDate } from '../lib/dates'
import { siteName } from '../lib/lookups'
import { paths } from '../lib/paths'
import type { SpotlightChallenge } from '../types'

const pct = (w: number) => `${Math.round(w * 100)}%`

function formatValue(key: CupComponent, v: number | null): string {
  if (v === null) return 'no data'
  switch (key) {
    case 'survival':
    case 'completeness':
      return `${Math.round(v * 100)}%`
    case 'water':
      return `${(v * 1000).toFixed(1)} g/L`
    case 'yield':
      return `${v.toFixed(2)} kg/m²`
    case 'participation':
      return `${v.toFixed(2)} /m²`
  }
}

function formatSpotlight(c: SpotlightChallenge, v: number | null): string {
  if (v === null) return 'no data'
  if (c.unit === '%') return `${Math.round(v * 100)}%`
  if (c.unit === 'kg/L') return `${(v * 1000).toFixed(1)} g/L`
  return `${v.toFixed(2)} ${c.unit}`
}

const monthLabel = (month: string) => new Date(`${month}-15T12:00:00`).toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })

/** Hall Garden Cup: halls compete as teams over a semester, plus a monthly spotlight. No individual scores. */
export default function HallCupPage() {
  usePageTitle('Hall Garden Cup')
  const { logs, sites } = useLogs()
  const { joins, tasks, claims, spotlights } = useCommunity()
  const input = useMemo(() => ({ logs, sites, joins, tasks, claims }), [logs, sites, joins, tasks, claims])
  const ranking = useMemo(() => hallCupRanking(input, CUP_SEMESTER), [input])
  const anchor = anchorDate(logs)
  const thisMonth = anchor.slice(0, 7)
  const months = Object.keys(spotlights)
    .filter((m) => m >= CUP_SEMESTER.start.slice(0, 7) && m <= thisMonth)
    .sort()
    .reverse()
  const campusSites = sites.filter((s) => !isHallSite(s))

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Hall Garden Cup' }]} />
      <Reveal className="max-w-3xl">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-accent uppercase">
          <Trophy className="size-4" aria-hidden />
          {CUP_SEMESTER.label}
        </p>
        <h1 className="mt-2 font-display text-display font-medium">The Hall Garden Cup</h1>
        <p className="mt-4 text-lg text-ink-muted lg:text-xl">
          Halls compete as teams, not individuals. Every measure is per m² or a rate, so a three-planter rooftop can
          beat a big garden. Standings to {formatDate(anchor)}.
        </p>
        <p className="mt-2 text-sm text-demo">{DEMO_DATA_SHORT_NOTICE} Halls marked “Demo hall site” are invented gardens.</p>
      </Reveal>

      <section aria-labelledby="ranking-heading" className="mt-12">
        <h2 id="ranking-heading" className="font-display text-section font-medium">
          Semester ranking
        </h2>
        {ranking.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="No hall gardens in the Cup yet" detail="When a hall site is approved it joins the Cup automatically." />
          </div>
        ) : (
          <ol className="mt-5 border-t border-ink">
            {ranking.map((e) => {
              const site = sites.find((s) => s.id === e.siteId)
              return (
                <Reveal as="li" key={e.siteId} className="grid gap-5 border-b border-line py-7 lg:grid-cols-12 lg:gap-8">
                  <div className="flex items-start gap-4 lg:col-span-4">
                    <span className={`font-display text-stat tabular-nums ${e.rank === 1 ? 'text-accent' : 'text-ink-subtle'}`} aria-label={`Rank ${e.rank}`}>
                      {e.rank}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-2xl font-medium">{e.hall}</h3>
                      <p className="text-ink-muted">
                        <Link to={paths.joinSite(e.siteId)} className="underline-offset-4 hover:underline">
                          {siteName(e.siteId)}
                        </Link>
                        {site && ` · ${site.areaSqm} m²`}
                      </p>
                      {site?.fictional && <p className="mt-1 inline-block rounded-sm bg-demo-bg px-2 py-0.5 text-xs font-semibold text-demo">Demo hall site</p>}
                      <p className="mt-3 text-sm text-ink-muted">Score</p>
                      <p className="font-display text-3xl font-medium tabular-nums">
                        {e.score.toFixed(1)}
                        <span className="text-base text-ink-muted"> / 100</span>
                      </p>
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
                      {CUP_COMPONENTS.map((c) => {
                        const comp = e.components[c.key]
                        return (
                          <div key={c.key}>
                            <dt className="flex items-baseline justify-between gap-2 text-sm">
                              <span className="font-semibold">{c.label}</span>
                              <span className="text-ink-muted tabular-nums">{pct(HALL_CUP_WEIGHTS[c.key])}</span>
                            </dt>
                            <dd>
                              <div className="mt-1 h-2 overflow-hidden rounded-full bg-sunken" aria-hidden>
                                <div className="h-full origin-left rounded-full bg-brand-600" style={{ transform: `scaleX(${comp.scaled / 100})` }} />
                              </div>
                              <p className="mt-1 flex justify-between text-sm tabular-nums">
                                <span>{formatValue(c.key, comp.value)}</span>
                                <span className="text-ink-muted">+{comp.points.toFixed(1)} pts</span>
                              </p>
                            </dd>
                          </div>
                        )
                      })}
                    </dl>
                    <p className="mt-4 flex items-start gap-2 rounded-sm bg-sunken px-3 py-2.5 text-sm">
                      <Info className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden />
                      <span>
                        <strong className="font-semibold">Why this rank: </strong>
                        {e.why}
                      </span>
                    </p>
                  </div>
                </Reveal>
              )
            })}
          </ol>
        )}
      </section>

      <section aria-labelledby="formula-heading" className="mt-16 grid gap-8 rounded-card bg-surface p-5 shadow-card lg:grid-cols-12 lg:p-8">
        <div className="lg:col-span-5">
          <h2 id="formula-heading" className="font-display text-section font-medium">
            How the score works
          </h2>
          <p className="mt-3 text-ink-muted">
            Each measure is turned into 0–100 by comparing a hall with the best hall on that measure (value ÷ best ×
            100). Then the five are weighted and added. Because every measure is per m² or a rate, garden size doesn’t
            decide the winner.
          </p>
          <p className="mt-4 rounded-sm bg-sunken px-3 py-3 font-mono text-sm leading-relaxed">
            Score = {CUP_COMPONENTS.map((c) => `${pct(HALL_CUP_WEIGHTS[c.key])} × ${c.short}`).join(' + ')}
          </p>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {CUP_COMPONENTS.map((c) => (
            <div key={c.key} className="border-t border-line pt-3">
              <dt className="font-semibold">
                {c.label} <span className="font-normal text-ink-muted">· {pct(HALL_CUP_WEIGHTS[c.key])}</span>
              </dt>
              <dd className="mt-0.5 text-sm text-ink-muted">{c.how}</dd>
            </div>
          ))}
          <div className="border-t border-line pt-3">
            <dt className="font-semibold">Who competes</dt>
            <dd className="mt-0.5 text-sm text-ink-muted">Hall sites only, as teams. No individual points or badges.</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="spotlight-heading" className="mt-16">
        <h2 id="spotlight-heading" className="flex items-center gap-2 font-display text-section font-medium">
          <Sparkles className="size-6 text-accent" aria-hidden />
          Monthly spotlight
        </h2>
        <p className="mt-1 max-w-2xl text-ink-muted">
          One team challenge a month, chosen by the Sustainability Office from a fixed list. It’s for bragging rights;
          it doesn’t change the semester score.
        </p>
        {months.length === 0 || ranking.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="No spotlight this month" detail="The Sustainability Office picks one at the start of each month." />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {months.map((month) => {
              const challenge = spotlightChallenges.find((c) => c.id === spotlights[month])
              if (!challenge) return null
              const standings = spotlightStandings(input, challenge.id, month)
              const current = month === thisMonth
              return (
                <article key={month} className={`rounded-card p-5 shadow-card ${current ? 'bg-accent-bg' : 'bg-surface'}`}>
                  <p className="text-sm font-semibold text-ink-muted">
                    {monthLabel(month)}
                    {current && ' · this month'}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-medium">{challenge.title}</h3>
                  <p className="mt-1 text-ink-muted">{challenge.pitch}</p>
                  <p className="mt-2 text-xs text-ink-muted">Measured as: {challenge.measure}</p>
                  <ol className="mt-4 space-y-1.5">
                    {standings.map((s, i) => (
                      <li key={s.siteId} className="flex items-baseline justify-between gap-3 border-b border-line/70 pb-1.5">
                        <span className={i === 0 && s.value !== null ? 'font-semibold' : ''}>
                          {i + 1}. {s.hall}
                          {i === 0 && s.value !== null && <span className="ml-1.5 text-accent">{current ? '(leading)' : '(winner)'}</span>}
                        </span>
                        <span className="text-sm tabular-nums">{formatSpotlight(challenge, s.value)}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="campus-heading" className="mt-16 flex flex-col gap-4 border-t border-line pt-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h2 id="campus-heading" className="font-display text-2xl font-medium">
            Not in a hall garden?
          </h2>
          <p className="mt-1 text-ink-muted">
            {campusSites.length > 0
              ? `${campusSites.map((s) => s.shortName).join(', ')} ${campusSites.length === 1 ? 'is a campus garden' : 'are campus gardens'}: open to everyone, outside the Cup.`
              : 'Every garden on campus is a hall garden right now.'}{' '}
            Or start one at your hall and enter next semester.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={paths.join} className="group inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-accent px-5 font-semibold text-white hover:bg-accent-strong">
            Join a garden
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  )
}
