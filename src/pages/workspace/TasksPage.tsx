import { ArrowUpRight, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import TaskRow from '../../components/community/TaskRow'
import Field from '../../components/log/Field'
import TextAreaField from '../../components/log/TextAreaField'
import EmptyState from '../../components/ui/EmptyState'
import ReadOnlyNotice from '../../components/workspace/ReadOnlyNotice'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import { DEMO_DATA_SHORT_NOTICE } from '../../data'
import { useCommunity, useCrops } from '../../hooks/useCommunity'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useWorkspaceSite } from '../../hooks/useWorkspaceSite'
import { communityFor } from '../../lib/community'
import { postTask, removeTask } from '../../lib/communityStore'
import { addDays, todayISO } from '../../lib/dates'
import { focusFirstIssue, inputClass, issueMessage, type FieldIssue } from '../../lib/forms'
import { notifyChange, notifyError } from '../../lib/notify'
import { paths } from '../../lib/paths'
import { claimsFor, upcomingTasks } from '../../lib/tasks'
import type { Site } from '../../types'
import NotFoundPage from '../NotFoundPage'

/** Help wanted for one site: post a task (date, slot, helpers), see who claimed it, take it down. */
export default function TasksPage() {
  const { site, canEdit } = useWorkspaceSite()
  const { tasks, claims, myClaims, communities } = useCommunity()
  usePageTitle(site ? `Help wanted · ${site.shortName}` : 'Site not found')
  if (!site) return <NotFoundPage title="Site not found" message="There is no site with that name. Pick one from the site switcher." />

  const siteTasks = tasks.filter((t) => t.siteId === site.id)
  const upcoming = upcomingTasks(siteTasks)
  const past = siteTasks.filter((t) => !upcoming.includes(t)).sort((a, b) => b.date.localeCompare(a.date))
  const meetingPoint = communityFor(communities, site.id).meetingPoint

  function takeDown(id: string, title: string) {
    const undo = removeTask(id)
    notifyChange(`“${title}” taken down`, undo)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-8">
      <WorkspaceHeader
        crumbs={[{ label: site.shortName }, { label: 'Help wanted' }]}
        title="Help wanted"
        lead={`Tasks students can claim at ${site.shortName}. They appear on Get involved and the Join page.`}
        actions={
          <Link to={paths.getInvolved} className="inline-flex min-h-12 items-center gap-1 rounded-sm border border-line-strong px-4 font-semibold hover:bg-sunken">
            Get involved page
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        }
      />
      {!canEdit && <ReadOnlyNotice site={site} tool="tasks" />}

      {canEdit && (
        <section aria-labelledby="post-heading" className="mb-8 rounded-card bg-surface p-5 shadow-card lg:p-6">
          <h2 id="post-heading" className="font-display text-2xl font-medium">
            Post a task
          </h2>
          <PostTaskForm key={site.id} site={site} />
        </section>
      )}

      <section aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="font-display text-2xl font-medium">
          Coming up
        </h2>
        <p className="mt-1 text-sm text-demo">{DEMO_DATA_SHORT_NOTICE}</p>
        {upcoming.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No tasks posted" detail={canEdit ? 'Post one above; beginner-friendly ones fill fastest.' : 'This site has nothing posted right now.'} />
          </div>
        ) : (
          <div className="mt-4 border-t border-ink">
            {upcoming.map((t) => {
              const who = claimsFor(claims, t.id)
              return (
                <div key={t.id}>
                  <TaskRow
                    task={t}
                    claims={claims}
                    myClaims={myClaims}
                    meetingPoint={meetingPoint}
                    extra={
                      canEdit && (
                        <button type="button" onClick={() => takeDown(t.id, t.title)} className="inline-flex min-h-12 items-center gap-1.5 px-3 font-semibold text-ink-muted underline underline-offset-4 hover:text-ink">
                          <Trash2 className="size-4" aria-hidden />
                          Take down
                        </button>
                      )
                    }
                  />
                  {canEdit && (
                    <p className="-mt-3 mb-4 text-sm text-ink-muted sm:pl-[calc(9rem+1.5rem)]">
                      Helpers: {who.length === 0 ? 'nobody yet' : who.map((c) => `${c.name}${c.hall ? ` (${c.hall})` : ''}`).join(', ')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past-heading" className="mt-10">
          <h2 id="past-heading" className="font-display text-2xl font-medium">
            Past tasks
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {past.map((t) => (
              <li key={t.id} className="flex min-h-12 flex-wrap items-center justify-between gap-2 py-2">
                <span>{t.title}</span>
                <span className="text-sm text-ink-muted">
                  {t.date} · {claimsFor(claims, t.id).length} of {t.helpersNeeded} came
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function PostTaskForm({ site }: { site: Site }) {
  const crops = useCrops()
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [date, setDate] = useState(addDays(todayISO(), 3))
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('10:00')
  const [helpers, setHelpers] = useState(3)
  const [beginner, setBeginner] = useState(true)
  const [cropId, setCropId] = useState('')
  const [showErrors, setShowErrors] = useState(false)

  const issues: FieldIssue[] = []
  if (!title.trim()) issues.push({ id: 'task-title', short: 'title', message: 'Say what the task is, e.g. “Weed bed 2”.' })
  if (!date || date < todayISO()) issues.push({ id: 'task-date', short: 'date', message: 'Pick today or a later date.' })
  if (!start || !end || end <= start) issues.push({ id: 'task-end', short: 'time', message: 'The slot must end after it starts.' })
  if (!(helpers >= 1 && helpers <= 30)) issues.push({ id: 'task-helpers', short: 'helpers', message: 'Between 1 and 30 helpers.' })

  function submit(e: FormEvent) {
    e.preventDefault()
    if (issues.length) {
      setShowErrors(true)
      focusFirstIssue(issues)
      return
    }
    const result = postTask({
      siteId: site.id,
      title: title.trim(),
      detail: detail.trim() || 'Details on the day.',
      date,
      start,
      end,
      helpersNeeded: helpers,
      beginnerFriendly: beginner,
      cropId: cropId || undefined,
    })
    if (!result.ok) {
      notifyError(result.error)
      return
    }
    notifyChange('Task posted', undefined, 'Students can claim a slot now.')
    setTitle('')
    setDetail('')
    setShowErrors(false)
  }

  return (
    <form onSubmit={submit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field id="task-title" label="Task" error={issueMessage(issues, 'task-title', showErrors)}>
          <input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <TextAreaField id="task-detail" label="What helpers will do, and what to bring" optional value={detail} onChange={setDetail} />
      </div>
      <Field id="task-date" label="Date" error={issueMessage(issues, 'task-date', showErrors)}>
        <input id="task-date" type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field id="task-start" label="Starts">
          <input id="task-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
        </Field>
        <Field id="task-end" label="Ends" error={issueMessage(issues, 'task-end', showErrors)}>
          <input id="task-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field id="task-helpers" label="Helpers needed" error={issueMessage(issues, 'task-helpers', showErrors)}>
        <input
          id="task-helpers"
          type="number"
          inputMode="numeric"
          min={1}
          max={30}
          value={helpers}
          onChange={(e) => setHelpers(Number(e.target.value))}
          className={inputClass}
        />
      </Field>
      <Field id="task-crop" label="Crop" optional>
        <select id="task-crop" value={cropId} onChange={(e) => setCropId(e.target.value)} className={inputClass}>
          <option value="">Not about one crop</option>
          {crops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <label className="flex min-h-12 cursor-pointer items-center gap-2 font-semibold sm:col-span-2">
        <input type="checkbox" checked={beginner} onChange={(e) => setBeginner(e.target.checked)} className="size-5 accent-brand-700" />
        Beginner-friendly (no experience needed)
      </label>
      <div className="sm:col-span-2">
        <button type="submit" className="inline-flex min-h-12 items-center rounded-sm bg-accent px-5 font-semibold text-white hover:bg-accent-strong">
          Post task
        </button>
        {showErrors && issues.length > 0 && <p className="mt-2 text-sm text-danger">Still needed: {issues.map((i) => i.short).join(', ')}</p>}
      </div>
    </form>
  )
}
