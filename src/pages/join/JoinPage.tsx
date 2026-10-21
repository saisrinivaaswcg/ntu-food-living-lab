import { ArrowRight, CalendarDays, Check, MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import NewcomerPath from '../../components/community/NewcomerPath'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import CropChips from '../../components/ui/CropChips'
import EmptyState from '../../components/ui/EmptyState'
import Reveal from '../../components/ui/Reveal'
import { DEMO_DATA_SHORT_NOTICE, pickPolicyOptions } from '../../data'
import { useCommunity } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { communityFor, formatWorkday, nextWorkday } from '../../lib/community'
import { formatDate } from '../../lib/dates'
import { cropsCurrentlyGrowing } from '../../lib/metrics'
import { paths } from '../../lib/paths'
import { upcomingTasks } from '../../lib/tasks'

/** Every garden community on campus: what it grows, when it meets and the roles it's looking for. */
export default function JoinPage() {
  usePageTitle('Join a community')
  const { logs, sites } = useLogs()
  const { communities, myJoins, tasks } = useCommunity()
  const rows = useMemo(
    () =>
      sites.map((site) => {
        const community = communityFor(communities, site.id)
        return { site, community, growing: cropsCurrentlyGrowing(logs, site), next: nextWorkday(community) }
      }),
    [sites, communities, logs],
  )
  const firstBeginnerTask = upcomingTasks(tasks).find((t) => t.beginnerFriendly)
  const joined = new Set(myJoins.map((j) => j.siteId))

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Join a community' }]} />
      <Reveal className="max-w-3xl">
        <h1 className="font-display text-display font-medium">Find your garden.</h1>
        <p className="mt-4 text-lg text-ink-muted lg:text-xl">
          Every garden on campus is run by students. Pick one near you, come to a workday, and you’ll know how to grow
          something by the end of the month. No experience needed.
        </p>
        <p className="mt-2 text-sm text-demo">{DEMO_DATA_SHORT_NOTICE}</p>
      </Reveal>

      <section aria-labelledby="path-heading" className="mt-12">
        <h2 id="path-heading" className="font-display text-section font-medium">
          New to growing? Three steps.
        </h2>
        <div className="mt-5">
          <NewcomerPath
            task={firstBeginnerTask}
            tasksHref={paths.getInvolved}
            next={null}
            meetHref="#communities"
            siteLabel="Your garden"
          />
        </div>
      </section>

      <section id="communities" aria-labelledby="communities-heading" className="mt-16 scroll-mt-24">
        <h2 id="communities-heading" className="font-display text-section font-medium">
          The communities
        </h2>
        {rows.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No garden communities yet" detail="When a site is set up, its community appears here." />
          </div>
        ) : (
          <ul className="mt-6 border-t border-ink">
            {rows.map(({ site, community, growing, next }) => (
              <Reveal as="li" key={site.id} className="grid gap-4 border-b border-line py-8 lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-5">
                  <h3 className="font-display text-2xl font-medium">
                    <Link to={paths.joinSite(site.id)} className="underline-offset-4 hover:underline">
                      {site.name}
                    </Link>
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                    <MapPin className="size-4" aria-hidden />
                    {site.locationNote}
                  </p>
                  <p className="mt-3 text-ink-muted">{community.welcome || site.description}</p>
                </div>
                <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:col-span-5">
                  <div>
                    <dt className="font-semibold">Growing now</dt>
                    <dd className="mt-1">
                      <CropChips cropIds={growing} emptyText="Nothing planted right now." />
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Workdays</dt>
                    <dd className="mt-1 space-y-0.5 text-ink-muted">
                      {community.workdays.length === 0 ? (
                        <p>Times to be set by the committee.</p>
                      ) : (
                        community.workdays.map((w) => <p key={`${w.weekday}${w.start}`}>{formatWorkday(w)}</p>)
                      )}
                      {next && (
                        <p className="flex items-center gap-1 pt-1 font-semibold text-ink">
                          <CalendarDays className="size-4" aria-hidden />
                          Next: {formatDate(next.date)}
                        </p>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Open roles</dt>
                    <dd className="mt-1 text-ink-muted">
                      {community.roles.length === 0 ? 'Any help welcome' : community.roles.map((r) => r.title).join(' · ')}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Picking</dt>
                    <dd className="mt-1 text-ink-muted">{pickPolicyOptions.find((p) => p.value === community.pickPolicy)?.label}</dd>
                  </div>
                </dl>
                <div className="flex flex-col items-start gap-2 lg:col-span-2 lg:items-end">
                  {joined.has(site.id) && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-brand-50 px-2 py-1 text-sm font-semibold text-brand-800">
                      <Check className="size-4" aria-hidden />
                      You asked to join
                    </span>
                  )}
                  <Link
                    to={paths.joinSite(site.id)}
                    className="group inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-brand-700 px-4 font-semibold text-white hover:bg-brand-800"
                  >
                    Meet them
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    <span className="sr-only">: {site.name}</span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
