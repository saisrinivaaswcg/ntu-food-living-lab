import { ArrowRight, ExternalLink, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DEMO_DATA_SHORT_NOTICE, nparksResources } from '../../data'
import { formatDate } from '../../lib/dates'
import { siteName } from '../../lib/lookups'
import { paths } from '../../lib/paths'
import type { Crop, HelpTask, Site, TaskClaim } from '../../types'
import EmptyState from '../ui/EmptyState'
import Reveal from '../ui/Reveal'

interface Props {
  crop: Crop
  /** Sites growing this crop now */
  sites: Site[]
  tasks: HelpTask[]
  claims: TaskClaim[]
}

/** The close: beginner sessions at the sites that grow this crop, the site to join, and NParks for more. */
export default function GrowWithUs({ crop, sites, tasks, claims }: Props) {
  const siteIds = new Set(sites.map((s) => s.id))
  const beginnerTasks = tasks
    .filter((t) => t.beginnerFriendly && (t.cropId === crop.id || (!t.cropId && siteIds.has(t.siteId))))
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
  const spotsLeft = (task: HelpTask) => task.helpersNeeded - claims.filter((c) => c.taskId === task.id).length
  const first = beginnerTasks[0]
  const home = first ? sites.find((s) => s.id === first.siteId) ?? sites[0] : sites[0]

  return (
    <section aria-labelledby="grow-heading" className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 id="grow-heading" className="font-display text-section font-medium">
              Grow {crop.name} with us
            </h2>
            <p className="mt-2 max-w-xl text-ink-muted">
              Beginner sessions at the gardens growing it now. No experience needed: someone from the committee shows
              you how. <span className="text-demo">{DEMO_DATA_SHORT_NOTICE}</span>
            </p>
            {beginnerTasks.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No beginner sessions posted right now"
                  detail={
                    sites.length > 0
                      ? `The gardens growing ${crop.name} post sessions most weeks. Visit one to meet the committee.`
                      : `No NTU garden is growing ${crop.name} right now.`
                  }
                />
              </div>
            ) : (
              <ul className="mt-8 border-t border-ink">
                {beginnerTasks.map((task) => {
                  const left = spotsLeft(task)
                  return (
                    <Reveal as="li" key={task.id} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatDate(task.date)}
                        <span className="block font-normal text-ink-muted">
                          {task.start} to {task.end}
                        </span>
                      </p>
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="mt-0.5 text-ink-muted">{task.detail}</p>
                        <p className="mt-1 text-sm">{siteName(task.siteId)}</p>
                      </div>
                      <p className={`text-sm font-semibold ${left > 0 ? 'text-brand-700' : 'text-ink-muted'}`}>
                        {left > 0 ? `${left} ${left === 1 ? 'spot' : 'spots'} left` : 'Full'}
                      </p>
                    </Reveal>
                  )
                })}
              </ul>
            )}
          </div>

          <aside aria-labelledby="nparks-heading">
            <h2 id="nparks-heading" className="font-display text-2xl font-medium">
              Learn more from NParks
            </h2>
            <ul className="mt-4 space-y-3">
              {nparksResources.map((r) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block min-h-12 border-b border-line pb-3"
                  >
                    <span className="inline-flex items-center gap-1 font-semibold underline-offset-4 group-hover:underline">
                      {r.title}
                      <ExternalLink className="size-4" aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </span>
                    <span className="block text-sm text-ink-muted">{r.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {/* The close holds: one action. */}
        {home && (
          <div className="mt-16 flex flex-col gap-5 border-t border-ink pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl font-display text-2xl font-medium lg:text-3xl">
              Start with one session at {home.shortName}. Bring a water bottle.
            </p>
            <Link
              to={paths.site(home.id)}
              className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-sm bg-accent px-5 font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              <Users className="size-4" aria-hidden />
              Meet the {home.shortName} garden
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
