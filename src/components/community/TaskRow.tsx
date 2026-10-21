import { CalendarPlus, Check, Sprout, Users } from 'lucide-react'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { useCommunity } from '../../hooks/useCommunity'
import { claimTask, unclaimTask } from '../../lib/communityStore'
import { formatDate } from '../../lib/dates'
import { inputClass } from '../../lib/forms'
import { cropName, siteName } from '../../lib/lookups'
import { notifyChange, notifyError } from '../../lib/notify'
import { claimsFor, downloadTaskIcs, spotsLeft } from '../../lib/tasks'
import type { HelpTask, TaskClaim } from '../../types'

interface Props {
  task: HelpTask
  claims: TaskClaim[]
  myClaims: TaskClaim[]
  /** Where helpers meet, for the calendar file */
  meetingPoint?: string
  /** Show which site the task is at (lists across sites) */
  showSite?: boolean
  /** Committee controls (e.g. take the task down), rendered at the end */
  extra?: ReactNode
}

/**
 * One help-wanted task: when, what, slots left, "Claim a slot" (name pre-filled from the student profile)
 * and "Add to calendar" (.ics).
 */
export default function TaskRow({ task, claims, myClaims, meetingPoint, showSite = false, extra }: Props) {
  const { profile } = useCommunity()
  const formId = useId()
  const [claiming, setClaiming] = useState(false)
  const [name, setName] = useState(profile?.name ?? '')
  const left = spotsLeft(task, claims)
  const mine = myClaims.find((c) => c.taskId === task.id)
  const taken = claimsFor(claims, task.id).length
  const where = `${siteName(task.siteId)}${meetingPoint ? `, ${meetingPoint}` : ''}`

  function claim(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const result = claimTask(task.id, name, profile?.hall)
    if (!result.ok) {
      notifyError(result.error)
      return
    }
    setClaiming(false)
    notifyChange('Slot claimed', undefined, `${task.title}, ${formatDate(task.date)} ${task.start}. Add it to your calendar.`)
  }

  function giveBack() {
    if (!mine) return
    const result = unclaimTask(mine.id)
    if (result.ok) notifyChange('Slot given back', () => claimTask(task.id, mine.name, mine.hall))
  }

  return (
    <div className="grid gap-3 border-b border-line py-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
      <p className="text-sm font-semibold tabular-nums">
        {formatDate(task.date)}
        <span className="block font-normal text-ink-muted">
          {task.start} to {task.end}
        </span>
      </p>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-semibold">{task.title}</h3>
          <p className={`text-sm font-semibold ${left > 0 ? 'text-brand-700' : 'text-ink-muted'}`}>
            <Users className="mr-1 inline size-4 align-[-3px]" aria-hidden />
            {taken} of {task.helpersNeeded} filled{left > 0 ? ` · ${left} ${left === 1 ? 'slot' : 'slots'} left` : ' · Full'}
          </p>
        </div>
        <p className="mt-0.5 text-ink-muted">{task.detail}</p>
        <p className="mt-1 flex flex-wrap gap-x-3 text-sm">
          {showSite && <span>{siteName(task.siteId)}</span>}
          {task.beginnerFriendly && (
            <span className="inline-flex items-center gap-1 text-brand-700">
              <Sprout className="size-4" aria-hidden />
              Beginner-friendly
            </span>
          )}
          {task.cropId && <span className="text-ink-muted">{cropName(task.cropId)}</span>}
          {task.source === 'demo' && <span className="text-demo">Demo task</span>}
        </p>

        {claiming && !mine ? (
          <form onSubmit={claim} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="sm:w-64">
              <label htmlFor={`${formId}-name`} className="mb-1 block text-sm font-semibold">
                Your name
              </label>
              <input
                id={`${formId}-name`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={80}
                required
                className={inputClass}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!name.trim()}
                className="inline-flex min-h-12 items-center rounded-sm bg-accent px-4 font-semibold text-white hover:bg-accent-strong disabled:bg-line-strong"
              >
                Confirm slot
              </button>
              <button type="button" onClick={() => setClaiming(false)} className="inline-flex min-h-12 items-center px-3 font-semibold underline underline-offset-4">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {mine ? (
              <>
                <span className="inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-brand-50 px-3 font-semibold text-brand-800">
                  <Check className="size-4" aria-hidden />
                  You have a slot ({mine.name})
                </span>
                <button type="button" onClick={giveBack} className="inline-flex min-h-12 items-center px-3 font-semibold underline underline-offset-4">
                  Give slot back
                </button>
              </>
            ) : (
              left > 0 && (
                <button
                  type="button"
                  onClick={() => setClaiming(true)}
                  className="inline-flex min-h-12 items-center rounded-sm bg-accent px-4 font-semibold text-white hover:bg-accent-strong"
                >
                  Claim a slot
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => downloadTaskIcs(task, where)}
              className="inline-flex min-h-12 items-center gap-1.5 rounded-sm border border-line-strong px-3 font-semibold hover:bg-sunken"
            >
              <CalendarPlus className="size-4" aria-hidden />
              Add to calendar
            </button>
            {extra}
          </div>
        )}
      </div>
    </div>
  )
}
