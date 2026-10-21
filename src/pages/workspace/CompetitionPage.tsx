import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import RoleGate from '../../components/access/RoleGate'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import { CUP_SEMESTER, spotlightChallenges } from '../../data'
import { useCommunity } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { setSpotlight } from '../../lib/communityStore'
import { CUP_COMPONENTS, HALL_CUP_WEIGHTS, isHallSite } from '../../lib/metrics'
import { notifyChange } from '../../lib/notify'
import { paths } from '../../lib/paths'
import type { SpotlightId } from '../../types'

/** The semester's months, "YYYY-MM". */
function semesterMonths(): string[] {
  const out: string[] = []
  let [y, m] = CUP_SEMESTER.start.split('-').map(Number)
  for (let key = ''; ; m === 12 ? ((m = 1), y++) : m++) {
    key = `${y}-${String(m).padStart(2, '0')}`
    if (key > CUP_SEMESTER.end.slice(0, 7)) break
    out.push(key)
  }
  return out
}

const monthLabel = (month: string) => new Date(`${month}-15T12:00:00`).toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })

/** Admin: pick each month's spotlight challenge from the fixed list; see who's in the Cup. */
export default function CompetitionPage() {
  usePageTitle('Hall Garden Cup settings')
  const { spotlights } = useCommunity()
  const { sites } = useLogs()
  const teams = sites.filter(isHallSite)

  function choose(month: string, id: SpotlightId) {
    const before = spotlights[month]
    setSpotlight(month, id)
    notifyChange(
      `${monthLabel(month)}: ${spotlightChallenges.find((c) => c.id === id)?.title}`,
      before ? () => setSpotlight(month, before) : undefined,
      'The Hall Cup page shows it now.',
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-8">
      <RoleGate allow={['admin']} what="Hall Garden Cup settings" why="The Sustainability Office runs the Cup and picks the monthly spotlight.">
        <WorkspaceHeader
          crumbs={[{ label: 'Hall Garden Cup' }]}
          title="Hall Garden Cup"
          lead={`${CUP_SEMESTER.label} · ${teams.length} hall ${teams.length === 1 ? 'team' : 'teams'}`}
          actions={
            <Link to={paths.hallCup} className="inline-flex min-h-12 items-center gap-1 rounded-sm border border-line-strong px-4 font-semibold hover:bg-sunken">
              Public standings
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          }
        />

        <section aria-labelledby="spot-heading" className="rounded-card bg-surface p-5 shadow-card lg:p-6">
          <h2 id="spot-heading" className="font-display text-2xl font-medium">
            Monthly spotlight
          </h2>
          <p className="mt-1 mb-5 text-sm text-ink-muted">One team challenge per month, from the fixed list. It doesn’t change the semester score.</p>
          <ul className="space-y-4">
            {semesterMonths().map((month) => (
              <li key={month} className="grid gap-2 border-t border-line pt-4 sm:grid-cols-[10rem_1fr] sm:items-center">
                <label htmlFor={`spot-${month}`} className="font-semibold">
                  {monthLabel(month)}
                </label>
                <div>
                  <select
                    id={`spot-${month}`}
                    value={spotlights[month] ?? ''}
                    onChange={(e) => choose(month, e.target.value as SpotlightId)}
                    className="block min-h-12 w-full rounded-sm border border-line-strong bg-surface px-3 text-base"
                  >
                    <option value="" disabled>
                      Not chosen yet
                    </option>
                    {spotlightChallenges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-ink-muted">{spotlightChallenges.find((c) => c.id === spotlights[month])?.measure ?? 'Pick one so halls know what to aim for.'}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="weights-heading" className="mt-6 rounded-card bg-surface p-5 shadow-card lg:p-6">
          <h2 id="weights-heading" className="font-display text-2xl font-medium">
            Score weights
          </h2>
          <p className="mt-1 mb-4 text-sm text-ink-muted">Fixed for the semester so the rules don’t move mid-season (HALL_CUP_WEIGHTS in src/lib/metrics.ts).</p>
          <ul className="grid gap-2 sm:grid-cols-5">
            {CUP_COMPONENTS.map((c) => (
              <li key={c.key} className="rounded-sm bg-sunken px-3 py-2">
                <p className="text-sm text-ink-muted">{c.label}</p>
                <p className="font-display text-2xl font-medium">{Math.round(HALL_CUP_WEIGHTS[c.key] * 100)}%</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="teams-heading" className="mt-6 rounded-card bg-surface p-5 shadow-card lg:p-6">
          <h2 id="teams-heading" className="font-display text-2xl font-medium">
            Teams
          </h2>
          {teams.length === 0 ? (
            <p className="mt-2 text-ink-muted">No hall sites yet. Approved hall sites join automatically.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {teams.map((s) => (
                <li key={s.id} className="flex min-h-12 flex-wrap items-center justify-between gap-2 py-2">
                  <span className="font-semibold">{s.hall}</span>
                  <span className="text-ink-muted">
                    {s.name} · {s.areaSqm} m²{s.fictional && <span className="text-demo"> · demo hall site</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </RoleGate>
    </div>
  )
}
