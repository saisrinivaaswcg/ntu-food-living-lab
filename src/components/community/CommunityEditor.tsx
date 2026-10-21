import { Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { pickPolicyOptions, WEEKDAY_NAMES } from '../../data'
import { roleIdFor } from '../../lib/community'
import { resetCommunityProfile, saveCommunity } from '../../lib/communityStore'
import { inputClass } from '../../lib/forms'
import { notifyChange, notifyError } from '../../lib/notify'
import type { CommunityRole, PickPolicy, SiteCommunity, Workday } from '../../types'
import ChoiceGroup from '../log/ChoiceGroup'
import Field from '../log/Field'
import TextAreaField from '../log/TextAreaField'

interface Props {
  community: SiteCommunity
  /** True when this device has changed the demo profile (offer a reset) */
  edited: boolean
}

/** A committee edits what Join shows about its site: welcome, workdays, meeting point, open roles, picking. */
export default function CommunityEditor({ community, edited }: Props) {
  const [welcome, setWelcome] = useState(community.welcome)
  const [workdays, setWorkdays] = useState<Workday[]>(community.workdays)
  const [meetingPoint, setMeetingPoint] = useState(community.meetingPoint)
  const [roles, setRoles] = useState<CommunityRole[]>(community.roles)
  const [pickPolicy, setPickPolicy] = useState<PickPolicy>(community.pickPolicy)
  const [newRole, setNewRole] = useState({ title: '', detail: '' })

  const badTimes = workdays.some((w) => !w.start || !w.end || w.end <= w.start)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (badTimes) {
      notifyError('Each workday needs an end time after its start time.')
      return
    }
    const before = community
    const result = saveCommunity({
      siteId: community.siteId,
      welcome: welcome.trim(),
      workdays: [...workdays].sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start)),
      meetingPoint: meetingPoint.trim(),
      roles: roles.filter((r) => r.title.trim()),
      pickPolicy,
    })
    if (result.ok) notifyChange('Community details saved', () => saveCommunity(before), 'The Join page shows them now.')
    else notifyError(result.error)
  }

  function addRole() {
    if (!newRole.title.trim()) return
    setRoles([...roles, { id: roleIdFor(newRole.title, roles.map((r) => r.id)), title: newRole.title.trim(), detail: newRole.detail.trim() }])
    setNewRole({ title: '', detail: '' })
  }

  const setDay = (i: number, patch: Partial<Workday>) => setWorkdays(workdays.map((w, j) => (j === i ? { ...w, ...patch } : w)))

  return (
    <form onSubmit={submit} className="space-y-6">
      <TextAreaField id="community-welcome" label="Welcome (a line or two, in your voice)" value={welcome} onChange={setWelcome} />

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">Workdays</legend>
        {workdays.length === 0 && <p className="mb-2 text-sm text-ink-muted">No regular workdays. Join shows “times to be set”.</p>}
        <ul className="space-y-2">
          {workdays.map((w, i) => (
            <li key={i} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_8rem_8rem_auto]">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor={`wd-day-${i}`} className="mb-1 block text-xs font-semibold text-ink-muted">
                  Day
                </label>
                <select id={`wd-day-${i}`} value={w.weekday} onChange={(e) => setDay(i, { weekday: Number(e.target.value) })} className={inputClass}>
                  {WEEKDAY_NAMES.map((d, n) => (
                    <option key={d} value={n}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`wd-start-${i}`} className="mb-1 block text-xs font-semibold text-ink-muted">
                  Start
                </label>
                <input id={`wd-start-${i}`} type="time" value={w.start} onChange={(e) => setDay(i, { start: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label htmlFor={`wd-end-${i}`} className="mb-1 block text-xs font-semibold text-ink-muted">
                  End
                </label>
                <input
                  id={`wd-end-${i}`}
                  type="time"
                  value={w.end}
                  onChange={(e) => setDay(i, { end: e.target.value })}
                  aria-invalid={w.end <= w.start ? true : undefined}
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => setWorkdays(workdays.filter((_, j) => j !== i))}
                className="col-span-2 inline-flex min-h-12 items-center justify-center gap-1 rounded-sm px-3 font-semibold text-ink-muted hover:bg-sunken sm:col-span-1"
              >
                <Trash2 className="size-4" aria-hidden />
                <span className="sm:sr-only">Remove {WEEKDAY_NAMES[w.weekday]}</span>
              </button>
            </li>
          ))}
        </ul>
        {badTimes && <p className="mt-1 text-sm font-medium text-danger">Each workday needs an end time after its start time.</p>}
        <button
          type="button"
          onClick={() => setWorkdays([...workdays, { weekday: 6, start: '09:00', end: '10:30' }])}
          className="mt-2 inline-flex min-h-12 items-center gap-1.5 rounded-sm border border-line-strong px-3 font-semibold hover:bg-sunken"
        >
          <Plus className="size-4" aria-hidden />
          Add a workday
        </button>
      </fieldset>

      <Field id="community-meet" label="Where newcomers meet you">
        <input id="community-meet" value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} maxLength={120} className={inputClass} />
      </Field>

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">Open roles</legend>
        {roles.length === 0 && <p className="mb-2 text-sm text-ink-muted">No roles listed. Join says any help is welcome.</p>}
        <ul className="space-y-2">
          {roles.map((r, i) => (
            <li key={r.id} className="rounded-sm border border-line p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
                <Field id={`role-title-${i}`} label="Role">
                  <input
                    id={`role-title-${i}`}
                    value={r.title}
                    onChange={(e) => setRoles(roles.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                    maxLength={60}
                    className={inputClass}
                  />
                </Field>
                <Field id={`role-detail-${i}`} label="What it involves">
                  <input
                    id={`role-detail-${i}`}
                    value={r.detail}
                    onChange={(e) => setRoles(roles.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)))}
                    maxLength={160}
                    className={inputClass}
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => setRoles(roles.filter((_, j) => j !== i))}
                  className="inline-flex min-h-12 items-center justify-center gap-1 rounded-sm px-3 font-semibold text-ink-muted hover:bg-sunken"
                >
                  <Trash2 className="size-4" aria-hidden />
                  <span className="sm:sr-only">Remove {r.title || 'role'}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid gap-2 rounded-sm bg-sunken p-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
          <Field id="role-new-title" label="New role">
            <input id="role-new-title" value={newRole.title} onChange={(e) => setNewRole({ ...newRole, title: e.target.value })} maxLength={60} placeholder="e.g. Seed saver" className={inputClass} />
          </Field>
          <Field id="role-new-detail" label="What it involves">
            <input id="role-new-detail" value={newRole.detail} onChange={(e) => setNewRole({ ...newRole, detail: e.target.value })} maxLength={160} className={inputClass} />
          </Field>
          <button
            type="button"
            onClick={addRole}
            disabled={!newRole.title.trim()}
            className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-sm border border-line-strong bg-surface px-3 font-semibold hover:bg-canvas disabled:text-ink-subtle"
          >
            <Plus className="size-4" aria-hidden />
            Add role
          </button>
        </div>
      </fieldset>

      <ChoiceGroup
        id="community-pick"
        legend="Can students pick what’s ready?"
        choices={pickPolicyOptions.map((p) => ({ value: p.value, label: p.label }))}
        value={pickPolicy}
        onChange={setPickPolicy}
        columnsClass="grid-cols-1 min-[420px]:grid-cols-3"
      />
      <p className="-mt-4 text-sm text-ink-muted">{pickPolicyOptions.find((p) => p.value === pickPolicy)?.detail}</p>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="inline-flex min-h-12 items-center rounded-sm bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800">
          Save community details
        </button>
        {edited && (
          <button
            type="button"
            onClick={() => {
              const before = community
              resetCommunityProfile(community.siteId)
              notifyChange('Community details reset to the original', () => saveCommunity(before))
            }}
            className="inline-flex min-h-12 items-center px-3 font-semibold underline underline-offset-4"
          >
            Reset to original values
          </button>
        )}
      </div>
    </form>
  )
}
