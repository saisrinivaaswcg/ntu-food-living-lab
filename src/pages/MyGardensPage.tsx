import { ArrowRight, CalendarDays, ShieldCheck, Sprout, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import TaskRow from '../components/community/TaskRow'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import ChoiceGroup from '../components/log/ChoiceGroup'
import Field from '../components/log/Field'
import SelectField from '../components/log/SelectField'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { contactMethodOptions, halls, JOIN_PRIVACY_NOTE, NO_HALL } from '../data'
import { useCommunity } from '../hooks/useCommunity'
import { usePageTitle } from '../hooks/usePageTitle'
import { communityFor, nextWorkday, roleTitle } from '../lib/community'
import { deleteProfile, joinCommunity, leaveCommunity, saveProfile } from '../lib/communityStore'
import { formatDate } from '../lib/dates'
import { inputClass } from '../lib/forms'
import { siteName } from '../lib/lookups'
import { notifyChange } from '../lib/notify'
import { paths } from '../lib/paths'
import type { ContactMethod, JoinRequest, StudentProfile } from '../types'

const STATUS_TEXT: Record<JoinRequest['status'], string> = {
  new: 'Sent: the committee hasn’t seen it yet',
  contacted: 'The committee has messaged you',
  welcomed: 'Welcomed: you’re a member',
}

/** A student's gardens: communities joined, slots claimed and the profile behind them (all on this device). */
export default function MyGardensPage() {
  usePageTitle('My gardens')
  const { profile, myJoins, communities, tasks, claims, myClaims } = useCommunity()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const myTasks = tasks
    .filter((t) => myClaims.some((c) => c.taskId === t.id))
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))

  function leave(join: JoinRequest) {
    leaveCommunity(join.id)
    const { id: _id, status: _status, createdAt: _created, source: _source, ...rest } = join
    notifyChange(`You left ${siteName(join.siteId, true)}`, () => joinCommunity(rest))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'My gardens' }]} />
      <h1 className="font-display text-display font-medium">My gardens</h1>
      <p className="mt-3 text-lg text-ink-muted">The communities you’ve asked to join and the slots you’ve claimed.</p>

      {!profile ? (
        <div className="mt-10 max-w-2xl">
          <EmptyState title="You haven’t joined a garden yet" detail="Join a community and your gardens, workdays and slots show up here." />
          <Link to={paths.join} className="group mt-5 inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-accent px-5 font-semibold text-white hover:bg-accent-strong">
            Find a garden
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-12">
            <section aria-labelledby="joined-heading">
              <h2 id="joined-heading" className="font-display text-section font-medium">
                Communities
              </h2>
              {myJoins.length === 0 ? (
                <div className="mt-4">
                  <EmptyState title="No communities yet" detail="Pick a garden near you and ask to join." />
                  <Link to={paths.join} className="mt-3 inline-flex min-h-12 items-center font-semibold text-brand-700 underline underline-offset-4">
                    Find a garden
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 border-t border-ink">
                  {myJoins.map((j) => {
                    const c = communityFor(communities, j.siteId)
                    const next = nextWorkday(c)
                    return (
                      <li key={j.id} className="border-b border-line py-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-display text-xl font-medium">
                            <Link to={paths.joinSite(j.siteId)} className="underline-offset-4 hover:underline">
                              {siteName(j.siteId)}
                            </Link>
                          </h3>
                          <span className={`text-sm font-semibold ${j.status === 'welcomed' ? 'text-brand-700' : 'text-ink-muted'}`}>{STATUS_TEXT[j.status]}</span>
                        </div>
                        <p className="mt-1 text-ink-muted">Role: {roleTitle(c, j.roleId)}</p>
                        {next && (
                          <p className="mt-1 flex items-center gap-1.5">
                            <CalendarDays className="size-4 text-brand-700" aria-hidden />
                            Next workday {formatDate(next.date)}, {next.workday.start} to {next.workday.end}
                            {c.meetingPoint && ` · ${c.meetingPoint}`}
                          </p>
                        )}
                        <button type="button" onClick={() => leave(j)} className="mt-2 inline-flex min-h-12 items-center font-semibold text-ink-muted underline underline-offset-4 hover:text-ink">
                          Leave this community
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <section aria-labelledby="slots-heading">
              <h2 id="slots-heading" className="font-display text-section font-medium">
                Slots you’ve claimed
              </h2>
              {myTasks.length === 0 ? (
                <div className="mt-4">
                  <EmptyState title="No slots claimed" detail="Beginner tasks are on each garden’s Join page." />
                </div>
              ) : (
                <div className="mt-4 border-t border-ink">
                  {myTasks.map((t) => (
                    <TaskRow key={t.id} task={t} claims={claims} myClaims={myClaims} meetingPoint={communityFor(communities, t.siteId).meetingPoint} showSite />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside aria-labelledby="profile-heading" className="self-start rounded-card bg-surface p-5 shadow-card">
            <h2 id="profile-heading" className="font-display text-2xl font-medium">
              Your details
            </h2>
            {profile.source === 'demo' && <p className="mt-1 text-sm text-demo">Demo student: try joining a garden to make your own.</p>}
            {editing ? (
              <ProfileEditor profile={profile} onDone={() => setEditing(false)} />
            ) : (
              <>
                <dl className="mt-4 space-y-2">
                  <div>
                    <dt className="text-sm text-ink-muted">Name</dt>
                    <dd className="font-semibold">{profile.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-ink-muted">Hall</dt>
                    <dd className="font-semibold">{profile.hall}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-ink-muted">{contactMethodOptions.find((o) => o.value === profile.contactMethod)?.label}</dt>
                    <dd className="font-semibold break-words">{profile.contact}</dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setEditing(true)} className="inline-flex min-h-12 items-center rounded-sm border border-line-strong px-4 font-semibold hover:bg-sunken">
                    Change details
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex min-h-12 items-center gap-1.5 px-3 font-semibold text-danger underline underline-offset-4">
                    <Trash2 className="size-4" aria-hidden />
                    Delete my details
                  </button>
                </div>
              </>
            )}
            <p className="mt-5 flex items-start gap-2 text-sm text-ink-muted">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden />
              {JOIN_PRIVACY_NOTE}
            </p>
          </aside>
        </div>
      )}

      <section aria-labelledby="more-heading" className="mt-16 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="more-heading" className="flex items-center gap-2 font-display text-2xl font-medium">
          <Sprout className="size-6 text-brand-700" aria-hidden />
          Want to learn a crop first?
        </h2>
        <Link to={paths.learn} className="inline-flex min-h-12 items-center font-semibold text-brand-700 underline underline-offset-4">
          Learn to grow
        </Link>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your details?"
        body="Your name, contact, the communities you asked to join and the slots you claimed are removed from this browser. You’ll be a Visitor again."
        confirmLabel="Delete my details"
        danger
        onConfirm={() => {
          deleteProfile()
          setConfirmDelete(false)
          notifyChange('Your details were deleted')
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

const hallOptions = [...halls, NO_HALL].map((h) => ({ value: h, label: h }))

function ProfileEditor({ profile, onDone }: { profile: StudentProfile; onDone: () => void }) {
  const [name, setName] = useState(profile.name)
  const [hall, setHall] = useState(profile.hall)
  const [contactMethod, setContactMethod] = useState<ContactMethod>(profile.contactMethod)
  const [contact, setContact] = useState(profile.contact)
  const method = contactMethodOptions.find((o) => o.value === contactMethod) ?? contactMethodOptions[0]
  const valid = name.trim() !== '' && contact.trim() !== ''

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!valid) return
    saveProfile({ ...profile, name: name.trim(), hall, contactMethod, contact: contact.trim(), source: 'user' })
    notifyChange('Your details were saved')
    onDone()
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <Field id="profile-name" label="Name">
        <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required className={inputClass} />
      </Field>
      <SelectField id="profile-hall" label="Hall" value={hall} onChange={setHall} options={hallOptions} placeholder="Choose your hall" />
      <ChoiceGroup
        id="profile-method"
        legend="Best way to reach you"
        choices={contactMethodOptions.map((o) => ({ value: o.value, label: o.label }))}
        value={contactMethod}
        onChange={setContactMethod}
        columnsClass="grid-cols-3"
      />
      <Field id="profile-contact" label={method.label}>
        <input
          id="profile-contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          inputMode={method.inputMode}
          placeholder={method.placeholder}
          maxLength={120}
          required
          className={inputClass}
        />
      </Field>
      <div className="flex gap-2">
        <button type="submit" disabled={!valid} className="inline-flex min-h-12 items-center rounded-sm bg-brand-700 px-4 font-semibold text-white hover:bg-brand-800 disabled:bg-line-strong">
          Save
        </button>
        <button type="button" onClick={onDone} className="inline-flex min-h-12 items-center px-3 font-semibold underline underline-offset-4">
          Cancel
        </button>
      </div>
    </form>
  )
}
