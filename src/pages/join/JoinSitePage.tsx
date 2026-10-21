import { ArrowUpRight, CalendarDays, Check, Leaf, MapPin, Pencil } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import JoinForm from '../../components/community/JoinForm'
import NewcomerPath from '../../components/community/NewcomerPath'
import TaskRow from '../../components/community/TaskRow'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import CropChips from '../../components/ui/CropChips'
import EmptyState from '../../components/ui/EmptyState'
import { DEMO_DATA_SHORT_NOTICE, pickPolicyOptions } from '../../data'
import { useCommunity } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { communityFor, formatWorkday, nextWorkday, roleTitle } from '../../lib/community'
import { formatDate } from '../../lib/dates'
import { findSite } from '../../lib/lookups'
import { cropsCurrentlyGrowing } from '../../lib/metrics'
import { paths } from '../../lib/paths'
import { canEditSite } from '../../lib/roles'
import { upcomingTasks } from '../../lib/tasks'
import NotFoundPage from '../NotFoundPage'

/** One site's community: what it grows, when it meets, open roles, beginner tasks and the join form. */
export default function JoinSitePage() {
  const { siteId } = useParams()
  const site = findSite(siteId)
  const { logs } = useLogs()
  const { communities, myJoins, tasks, claims, myClaims, role } = useCommunity()
  const [pickedRole, setPickedRole] = useState<string | undefined>()
  const [editing, setEditing] = useState(false)
  usePageTitle(site ? `Join ${site.shortName}` : 'Site not found')
  const growing = useMemo(() => (site ? cropsCurrentlyGrowing(logs, site) : []), [logs, site])

  if (!site) {
    return <NotFoundPage title="Site not found" message={`There is no garden called "${siteId ?? ''}". Choose one from Join a community.`} />
  }

  const community = communityFor(communities, site.id)
  const next = nextWorkday(community)
  const siteTasks = upcomingTasks(tasks).filter((t) => t.siteId === site.id)
  const beginnerTasks = siteTasks.filter((t) => t.beginnerFriendly)
  const myJoin = myJoins.find((j) => j.siteId === site.id)
  const showForm = !myJoin || editing
  const policy = pickPolicyOptions.find((p) => p.value === community.pickPolicy)

  function pickRole(id: string) {
    setPickedRole(id)
    setEditing(true)
    document.getElementById('join')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Join a community', to: paths.join }, { label: site.shortName }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="font-display text-display font-medium">{site.name}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-ink-muted">
            <MapPin className="size-4" aria-hidden />
            {site.locationNote}
          </p>
          <p className="mt-4 text-lg lg:text-xl">{community.welcome || site.description}</p>
          <p className="mt-2 text-sm text-demo">{DEMO_DATA_SHORT_NOTICE}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEditSite(role, site.id) && (
            <Link
              to={`${paths.siteTool(site.id, 'manage')}#community`}
              className="inline-flex min-h-12 items-center gap-1.5 rounded-sm border border-line-strong px-4 font-semibold hover:bg-sunken"
            >
              <Pencil className="size-4" aria-hidden />
              Edit community details
            </Link>
          )}
          <Link to={paths.site(site.id)} className="inline-flex min-h-12 items-center gap-1 px-2 font-semibold underline underline-offset-4">
            Site page
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-12 lg:col-span-7">
          <section aria-labelledby="grows-heading">
            <h2 id="grows-heading" className="font-display text-section font-medium">
              What we grow
            </h2>
            <div className="mt-4">
              <CropChips cropIds={growing} linkToLearn emptyText="Nothing is planted right now; the next planting day is a good time to start." />
            </div>
            {policy && (
              <p className="mt-4 flex items-start gap-2 text-ink-muted">
                <Leaf className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden />
                <span>
                  <strong className="font-semibold text-ink">{policy.label}:</strong> {policy.detail}
                </span>
              </p>
            )}
          </section>

          <section aria-labelledby="when-heading">
            <h2 id="when-heading" className="font-display text-section font-medium">
              Workdays
            </h2>
            {community.workdays.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No regular workdays set yet" detail="Ask to join and the committee will message you with a time." />
              </div>
            ) : (
              <ul className="mt-4 border-t border-ink">
                {community.workdays.map((w) => (
                  <li key={`${w.weekday}${w.start}`} className="flex min-h-12 items-center gap-2 border-b border-line py-3">
                    <CalendarDays className="size-5 text-brand-700" aria-hidden />
                    <span className="font-semibold">{formatWorkday(w)}</span>
                  </li>
                ))}
              </ul>
            )}
            {community.meetingPoint && (
              <p className="mt-3 text-ink-muted">
                Meet at <strong className="font-semibold text-ink">{community.meetingPoint.charAt(0).toLowerCase() + community.meetingPoint.slice(1)}</strong>
                {next && `. Next session: ${formatDate(next.date)}, ${next.workday.start}.`}
              </p>
            )}
          </section>

          <section aria-labelledby="roles-heading">
            <h2 id="roles-heading" className="font-display text-section font-medium">
              Open roles
            </h2>
            {community.roles.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No specific roles listed" detail="Any help is welcome; say what you’d like to do when you join." />
              </div>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {community.roles.map((r) => (
                  <li key={r.id} className="flex flex-col rounded-card bg-surface p-4 shadow-card">
                    <h3 className="font-semibold">{r.title}</h3>
                    <p className="mt-1 flex-1 text-sm text-ink-muted">{r.detail}</p>
                    <button
                      type="button"
                      onClick={() => pickRole(r.id)}
                      className="mt-3 inline-flex min-h-12 items-center self-start font-semibold text-brand-700 underline underline-offset-4"
                    >
                      I’d like this role
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="tasks" aria-labelledby="tasks-heading" className="scroll-mt-24">
            <h2 id="tasks-heading" className="font-display text-section font-medium">
              Beginner tasks
            </h2>
            <p className="mt-1 text-ink-muted">Claim a slot: someone from the committee shows you how on the day.</p>
            {beginnerTasks.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No beginner tasks posted right now" detail="Come to a workday instead; they’re open to everyone." />
              </div>
            ) : (
              <div className="mt-4 border-t border-ink">
                {beginnerTasks.map((t) => (
                  <TaskRow key={t.id} task={t} claims={claims} myClaims={myClaims} meetingPoint={community.meetingPoint} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:col-span-5">
          <section id="join" aria-labelledby="join-heading" className="scroll-mt-24 rounded-card bg-surface p-5 shadow-card lg:sticky lg:top-24 lg:p-6">
            {showForm ? (
              <>
                <h2 id="join-heading" className="font-display text-2xl font-medium">
                  {myJoin ? 'Update your request' : 'Join this community'}
                </h2>
                <p className="mt-1 mb-5 text-sm text-ink-muted">Takes a minute. The committee messages you before the next workday.</p>
                <JoinForm
                  key={pickedRole ?? 'default'}
                  site={site}
                  community={community}
                  initialRoleId={pickedRole ?? myJoin?.roleId}
                  onJoined={() => setEditing(false)}
                />
              </>
            ) : (
              <>
                <h2 id="join-heading" className="flex items-center gap-2 font-display text-2xl font-medium">
                  <Check className="size-6 text-brand-700" aria-hidden />
                  You asked to join
                </h2>
                <p className="mt-2 text-ink-muted">
                  As {myJoin.name}, for <strong className="font-semibold text-ink">{roleTitle(community, myJoin.roleId)}</strong>.
                  {myJoin.status === 'new' && ' The committee hasn’t seen it yet.'}
                  {myJoin.status === 'contacted' && ' The committee has messaged you.'}
                  {myJoin.status === 'welcomed' && ' You’re in: see you at the next workday.'}
                </p>
                {next && (
                  <p className="mt-3 font-semibold">
                    Next workday: {formatDate(next.date)}, {next.workday.start} to {next.workday.end}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to={paths.myGardens} className="inline-flex min-h-12 items-center rounded-sm bg-brand-700 px-4 font-semibold text-white hover:bg-brand-800">
                    My gardens
                  </Link>
                  <button type="button" onClick={() => setEditing(true)} className="inline-flex min-h-12 items-center rounded-sm border border-line-strong px-4 font-semibold hover:bg-sunken">
                    Change details
                  </button>
                </div>
              </>
            )}
          </section>
        </aside>
      </div>

      <section aria-labelledby="path-heading" className="mt-16 border-t border-line pt-10">
        <h2 id="path-heading" className="font-display text-section font-medium">
          Your first month
        </h2>
        <div className="mt-5">
          <NewcomerPath
            cropId={growing[0]}
            task={beginnerTasks[0]}
            tasksHref="#tasks"
            next={next}
            meetingPoint={community.meetingPoint}
            meetHref="#join"
            siteLabel={site.shortName}
          />
        </div>
      </section>
    </div>
  )
}
