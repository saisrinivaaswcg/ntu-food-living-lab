import { ArrowRight, Sprout } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TaskRow from '../components/community/TaskRow'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import EmptyState from '../components/ui/EmptyState'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'
import { DEMO_DATA_SHORT_NOTICE, pickPolicyOptions, illustrations } from '../data'
import { useCommunity } from '../hooks/useCommunity'
import { useLogs } from '../hooks/useLogs'
import { usePageTitle } from '../hooks/usePageTitle'
import { communityFor } from '../lib/community'
import { inputClass } from '../lib/forms'
import { cropName } from '../lib/lookups'
import { growthAsOf, growthTimelines } from '../lib/metrics'
import { paths } from '../lib/paths'
import { upcomingTasks } from '../lib/tasks'
import type { PickPolicy } from '../types'

const POLICY_TONE: Record<PickPolicy, string> = {
  'help-yourself': 'bg-brand-50 text-brand-800',
  'ask-first': 'bg-demo-bg text-demo',
  'committee-only': 'bg-sunken text-ink-muted',
}

/** Help wanted across every garden, and what's ready to pick (and whether students may take some). */
export default function GetInvolvedPage() {
  usePageTitle('Get involved')
  const { logs, sites } = useLogs()
  const { tasks, claims, myClaims, communities } = useCommunity()
  const [site, setSite] = useState<string>('all')
  const [beginnerOnly, setBeginnerOnly] = useState(false)
  const asOf = growthAsOf(logs)

  const shown = upcomingTasks(tasks).filter((t) => (site === 'all' || t.siteId === site) && (!beginnerOnly || t.beginnerFriendly))
  const ready = useMemo(
    () =>
      sites
        .map((s) => ({
          site: s,
          beds: growthTimelines(logs, [s.id], asOf).filter((t) => t.stage === 'ready' || t.stage === 'harvesting'),
        }))
        .filter((r) => r.beds.length > 0),
    [logs, sites, asOf],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Get involved' }]} />
      <PageHero slot={illustrations.heroes.getInvolved}>
        <Reveal className="max-w-3xl">
          <h1 className="font-display text-display font-medium">An hour helps.</h1>
          <p className="mt-4 text-lg text-ink-muted lg:text-xl">
            Committees post the jobs they need hands for. Claim a slot, add it to your calendar and turn up: someone shows
            you what to do.
          </p>
          <p className="mt-2 text-sm text-demo">{DEMO_DATA_SHORT_NOTICE}</p>
        </Reveal>
      </PageHero>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-10">
        <section aria-labelledby="help-heading" className="lg:col-span-8">
          <h2 id="help-heading" className="font-display text-section font-medium">
            Help wanted
          </h2>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-72">
              <label htmlFor="gi-site" className="mb-1 block text-sm font-semibold">
                Garden
              </label>
              <select id="gi-site" value={site} onChange={(e) => setSite(e.target.value)} className={inputClass}>
                <option value="all">Every garden</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex min-h-12 cursor-pointer items-center gap-2 font-semibold">
              <input type="checkbox" checked={beginnerOnly} onChange={(e) => setBeginnerOnly(e.target.checked)} className="size-5 accent-brand-700" />
              Beginner-friendly only
            </label>
          </div>
          {shown.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                illustration={illustrations.empty.tasks}
                title="No tasks match"
                detail={tasks.length === 0 ? 'Committees haven’t posted any tasks yet.' : 'Try every garden, or include tasks that need some experience.'}
              />
            </div>
          ) : (
            <div className="mt-5 border-t border-ink">
              {shown.map((t) => (
                <TaskRow key={t.id} task={t} claims={claims} myClaims={myClaims} meetingPoint={communityFor(communities, t.siteId).meetingPoint} showSite />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="ready-heading" className="lg:col-span-4">
          <h2 id="ready-heading" className="font-display text-section font-medium">
            Ready to pick
          </h2>
          <p className="mt-1 text-ink-muted">Crops at harvest stage now, and whether students may take some.</p>
          {ready.length === 0 ? (
            <div className="mt-5">
              <EmptyState illustration={illustrations.empty.ready} title="Nothing is ready right now" detail="Check back after the next workday." />
            </div>
          ) : (
            <ul className="mt-5 space-y-4">
              {ready.map(({ site: s, beds }) => {
                const policy = pickPolicyOptions.find((p) => p.value === communityFor(communities, s.id).pickPolicy)
                return (
                  <li key={s.id} className="rounded-card bg-surface p-4 shadow-card">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold">{s.name}</h3>
                      {policy && <span className={`rounded-sm px-2 py-0.5 text-sm font-semibold ${POLICY_TONE[policy.value]}`}>{policy.label}</span>}
                    </div>
                    {policy && <p className="mt-1 text-sm text-ink-muted">{policy.detail}</p>}
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {beds.map((b) => (
                        <li key={b.status.bed.id}>
                          <Link
                            to={paths.bed(s.id, b.status.bed.id)}
                            className="inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-sunken px-3 text-sm hover:bg-brand-50"
                          >
                            <Sprout className="size-4 text-brand-700" aria-hidden />
                            {cropName(b.status.planting?.cropId ?? '')}
                            <span className="text-ink-muted">· {b.status.bed.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-16 flex flex-col gap-4 border-t border-ink pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl font-display text-2xl font-medium lg:text-3xl">Like it? Join a garden and you’ll hear about every workday.</p>
        <Link to={paths.join} className="group inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-sm bg-accent px-5 font-semibold text-white hover:bg-accent-strong">
          Join a community
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </section>
    </div>
  )
}
