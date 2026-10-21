import { Check, KeyRound, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReadOnlyNotice from '../../components/workspace/ReadOnlyNotice'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import { CUP_SEMESTER, HANDOVER_CHECKLIST_TEMPLATE, issuePriorityOptions, problemLog, siteStatusLabels } from '../../data'
import { useCommunity, useHandovers } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useWorkspaceSite } from '../../hooks/useWorkspaceSite'
import { committeePin, saveHandover } from '../../lib/communityStore'
import { todayISO } from '../../lib/dates'
import { inputClass } from '../../lib/forms'
import { lessonCandidates, openProblems, termSummary } from '../../lib/handover'
import { cropName } from '../../lib/lookups'
import { bedStatuses, growthAsOf } from '../../lib/metrics'
import { notifyChange, notifyError } from '../../lib/notify'
import { paths } from '../../lib/paths'
import type { HandoverRecord, OpenIssue, Person, Site, SiteStatus } from '../../types'
import NotFoundPage from '../NotFoundPage'

const STEPS = ['Contacts', 'Open issues', 'Lessons', 'Bed status', 'PIN handover'] as const
const MAX_LESSONS = 5

/** The handover wizard: five steps that end in a printable handover pack and a new committee PIN. */
export default function HandoverWizardPage() {
  const { site, canEdit } = useWorkspaceSite()
  usePageTitle(site ? `Hand over ${site.shortName}` : 'Site not found')
  if (!site) return <NotFoundPage title="Site not found" message="There is no site with that name. Pick one from the site switcher." />
  return (
    <div className="mx-auto max-w-4xl px-4 py-5 lg:px-8 lg:py-8">
      <WorkspaceHeader
        crumbs={[{ label: site.shortName }, { label: 'Handover', to: paths.siteTool(site.id, 'handover') }, { label: 'New handover' }]}
        title="Hand over the site"
        lead="Five steps. At the end you get a printable handover pack and a summary of the term, made from the logs."
      />
      {canEdit ? <Wizard key={site.id} site={site} /> : <ReadOnlyNotice site={site} tool="handover" />}
    </div>
  )
}

const blankPerson = (): Person => ({ name: '', role: '', contact: '' })

function Wizard({ site }: { site: Site }) {
  const navigate = useNavigate()
  const { logs } = useLogs()
  const { joins, tasks, claims } = useCommunity()
  const [latest] = useHandovers(site.id)
  const asOf = growthAsOf(logs)
  const beds = useMemo(() => bedStatuses(logs, site, asOf), [logs, site, asOf])
  const candidates = useMemo(() => {
    const fromLog = lessonCandidates(problemLog, site.id)
    return [...new Set([...fromLog, ...(latest?.lessonsLearnt ?? [])])]
  }, [site.id, latest])
  const summary = useMemo(() => termSummary(logs, site, CUP_SEMESTER, { joins, tasks, claims }), [logs, site, joins, tasks, claims])

  const [step, setStep] = useState(0)
  const [outgoing, setOutgoing] = useState<Person[]>(latest?.incomingLeads.length ? latest.incomingLeads : [blankPerson()])
  const [incoming, setIncoming] = useState<Person[]>([blankPerson()])
  const [contacts, setContacts] = useState<Person[]>(latest?.contacts ?? [])
  const [issues, setIssues] = useState<OpenIssue[]>(latest?.openIssues ?? [])
  const [lessons, setLessons] = useState<string[]>(candidates.slice(0, MAX_LESSONS))
  const [customLesson, setCustomLesson] = useState('')
  const [siteStatus, setSiteStatus] = useState<SiteStatus>(latest?.siteStatus ?? site.status)
  const [statusSummary, setStatusSummary] = useState(latest?.statusSummary ?? site.statusNote)
  const [bedNotes, setBedNotes] = useState<Record<string, string>>({})
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const suggestions = openProblems(problemLog, site.id).filter((p) => !issues.some((i) => i.title === p.title))

  const named = (list: Person[]) => list.filter((p) => p.name.trim())
  const stepError = [
    named(incoming).length === 0 ? 'Add at least one incoming lead.' : null,
    issues.some((i) => !i.title.trim()) ? 'Every open issue needs a title.' : null,
    lessons.length === 0 ? 'Pick at least one lesson.' : null,
    null,
    pin && !/^\d{4,6}$/.test(pin) ? 'The PIN is 4 to 6 digits.' : pin !== pin2 ? 'The two PINs don’t match.' : null,
  ][step]

  function finish() {
    if (stepError) return
    const record: HandoverRecord = {
      id: `handover-${site.id}-${Date.now().toString(36)}`,
      siteId: site.id,
      date: todayISO(),
      term: CUP_SEMESTER.label,
      outgoingLeads: named(outgoing),
      incomingLeads: named(incoming),
      siteStatus,
      statusSummary: statusSummary.trim(),
      openIssues: issues,
      contacts: named(contacts),
      lessonsLearnt: lessons,
      checklist: HANDOVER_CHECKLIST_TEMPLATE.map((c) => ({ ...c, done: c.id === 'bedmap' || (c.id === 'issues' && issues.length > 0) })),
      beds: beds.map((b) => ({ bedId: b.bed.id, label: b.bed.label, cropId: b.planting?.cropId ?? null, plants: b.plantsAlive, note: bedNotes[b.bed.id]?.trim() || undefined })),
      termSummary: summary,
      pinChanged: Boolean(pin),
      source: 'user',
    }
    const result = saveHandover(record, pin || undefined)
    if (!result.ok) {
      notifyError(result.error)
      return
    }
    notifyChange('Handover saved', undefined, pin ? 'The new PIN works from now on.' : undefined)
    navigate(`${paths.siteTool(site.id, 'handover')}/pack?id=${encodeURIComponent(record.id)}`)
  }

  return (
    <div>
      <ol className="mb-6 grid grid-cols-5 gap-1" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              aria-current={i === step ? 'step' : undefined}
              disabled={i > step}
              className={`flex min-h-12 w-full flex-col items-start justify-center rounded-sm px-2 text-left text-xs font-semibold sm:text-sm ${
                i === step ? 'bg-brand-700 text-white' : i < step ? 'bg-brand-50 text-brand-800 hover:bg-brand-100' : 'bg-sunken text-ink-muted'
              }`}
            >
              <span className="tabular-nums">{i < step ? <Check className="inline size-4" aria-hidden /> : i + 1}</span>
              <span className="hidden sm:block">{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <section aria-labelledby="step-heading" className="rounded-card bg-surface p-5 shadow-card lg:p-6">
        <h2 id="step-heading" className="font-display text-2xl font-medium">
          {step + 1}. {STEPS[step]}
        </h2>

        {step === 0 && (
          <div className="mt-4 space-y-6">
            <PeopleEditor title="Outgoing leads (you)" people={outgoing} onChange={setOutgoing} idPrefix="out" />
            <PeopleEditor title="Incoming leads" people={incoming} onChange={setIncoming} idPrefix="in" />
            <PeopleEditor title="Other contacts (hall office, facilities, suppliers)" people={contacts} onChange={setContacts} idPrefix="contact" allowEmpty />
          </div>
        )}

        {step === 1 && (
          <div className="mt-4 space-y-3">
            {issues.length === 0 && <p className="text-ink-muted">No open issues. Add any the next committee should know about.</p>}
            {issues.map((issue, i) => (
              <div key={i} className="grid gap-2 rounded-sm border border-line p-3 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
                <div>
                  <label htmlFor={`issue-${i}`} className="mb-1 block text-sm font-semibold">
                    Issue
                  </label>
                  <input id={`issue-${i}`} value={issue.title} onChange={(e) => setIssues(issues.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} className={inputClass} />
                </div>
                <div>
                  <label htmlFor={`issue-p-${i}`} className="mb-1 block text-sm font-semibold">
                    Priority
                  </label>
                  <select
                    id={`issue-p-${i}`}
                    value={issue.priority}
                    onChange={(e) => setIssues(issues.map((x, j) => (j === i ? { ...x, priority: e.target.value as OpenIssue['priority'] } : x)))}
                    className={inputClass}
                  >
                    {issuePriorityOptions.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={() => setIssues(issues.filter((_, j) => j !== i))} className="inline-flex size-12 items-center justify-center rounded-sm text-ink-muted hover:bg-sunken">
                  <Trash2 className="size-4" aria-hidden />
                  <span className="sr-only">Remove issue {i + 1}</span>
                </button>
                <div className="sm:col-span-3">
                  <label htmlFor={`issue-d-${i}`} className="mb-1 block text-sm font-semibold">
                    Detail
                  </label>
                  <textarea id={`issue-d-${i}`} rows={2} value={issue.detail} onChange={(e) => setIssues(issues.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)))} className={`${inputClass} py-3`} />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setIssues([...issues, { title: '', priority: 'medium', detail: '' }])} className="inline-flex min-h-12 items-center gap-1.5 rounded-sm border border-line-strong px-3 font-semibold hover:bg-sunken">
              <Plus className="size-4" aria-hidden />
              Add an issue
            </button>
            {suggestions.length > 0 && (
              <div className="rounded-sm bg-sunken p-3">
                <p className="text-sm font-semibold">Still open in the problem log</p>
                <ul className="mt-1">
                  {suggestions.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setIssues([...issues, { title: p.title, priority: 'medium', detail: `${p.symptoms} Tried: ${p.actionTaken}` }])}
                        className="inline-flex min-h-12 items-center gap-1.5 text-left font-semibold text-brand-700 underline underline-offset-4"
                      >
                        <Plus className="size-4 shrink-0" aria-hidden />
                        {p.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="mt-4">
            <p className="text-ink-muted">
              Pick the top {MAX_LESSONS} from what this site’s problem log says worked. {lessons.length} of {MAX_LESSONS} chosen.
            </p>
            {candidates.length === 0 && <p className="mt-3 text-ink-muted">No resolved problems logged yet: write your own below.</p>}
            <ul className="mt-3 space-y-1.5">
              {[...new Set([...candidates, ...lessons])].map((l) => {
                const on = lessons.includes(l)
                return (
                  <li key={l}>
                    <label className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-sm border px-3 py-2.5 ${on ? 'border-brand-700 bg-brand-50' : 'border-line-strong'}`}>
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={!on && lessons.length >= MAX_LESSONS}
                        onChange={() => setLessons(on ? lessons.filter((x) => x !== l) : [...lessons, l])}
                        className="mt-0.5 size-5 shrink-0 accent-brand-700"
                      />
                      <span>{l}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="lesson-own" className="mb-1 block text-sm font-semibold">
                  A lesson of your own
                </label>
                <input id="lesson-own" value={customLesson} onChange={(e) => setCustomLesson(e.target.value)} maxLength={200} className={inputClass} />
              </div>
              <button
                type="button"
                disabled={!customLesson.trim() || lessons.length >= MAX_LESSONS}
                onClick={() => {
                  setLessons([...lessons, customLesson.trim()])
                  setCustomLesson('')
                }}
                className="inline-flex min-h-12 items-center rounded-sm border border-line-strong px-3 font-semibold hover:bg-sunken disabled:text-ink-subtle"
              >
                Add lesson
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
              <div>
                <label htmlFor="ho-status" className="mb-1 block text-sm font-semibold">
                  Site status
                </label>
                <select id="ho-status" value={siteStatus} onChange={(e) => setSiteStatus(e.target.value as SiteStatus)} className={inputClass}>
                  {(Object.keys(siteStatusLabels) as SiteStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {siteStatusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ho-summary" className="mb-1 block text-sm font-semibold">
                  In a sentence
                </label>
                <input id="ho-summary" value={statusSummary} onChange={(e) => setStatusSummary(e.target.value)} maxLength={200} className={inputClass} />
              </div>
            </div>
            <p className="text-sm text-ink-muted">Beds as the logs show them today. Add a note where the next committee needs one.</p>
            <ul className="divide-y divide-line border-y border-line">
              {beds.map((b) => (
                <li key={b.bed.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_1.2fr] sm:items-center">
                  <p>
                    <span className="font-semibold">{b.bed.label}</span>
                    <span className="block text-sm text-ink-muted">{b.planting ? `${cropName(b.planting.cropId)}, ${b.plantsAlive} plants` : 'Empty'}</span>
                  </p>
                  <div>
                    <label htmlFor={`bed-note-${b.bed.id}`} className="sr-only">
                      Note for {b.bed.label}
                    </label>
                    <input
                      id={`bed-note-${b.bed.id}`}
                      value={bedNotes[b.bed.id] ?? ''}
                      onChange={(e) => setBedNotes({ ...bedNotes, [b.bed.id]: e.target.value })}
                      placeholder="Note (optional)"
                      maxLength={140}
                      className={inputClass}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 4 && (
          <div className="mt-4 space-y-4">
            <p className="flex items-start gap-2 text-ink-muted">
              <KeyRound className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden />
              Set a new committee PIN and tell it to the incoming leads in person. The pack never prints it. Demo: the current PIN is {committeePin(site.id)}.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="pin-new" className="mb-1 block text-sm font-semibold">
                  New PIN <span className="font-normal text-ink-muted">(optional)</span>
                </label>
                <input id="pin-new" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} className={inputClass} />
              </div>
              <div>
                <label htmlFor="pin-again" className="mb-1 block text-sm font-semibold">
                  New PIN again
                </label>
                <input id="pin-again" inputMode="numeric" autoComplete="off" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, '').slice(0, 6))} className={inputClass} />
              </div>
            </div>
            <div className="rounded-sm bg-sunken p-4">
              <p className="font-semibold">The term so far (goes in the pack)</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {summary.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {stepError && (
          <p className="mt-4 text-sm font-medium text-danger" role="status">
            {stepError}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => (step === 0 ? navigate(paths.siteTool(site.id, 'handover')) : setStep(step - 1))}
            className="inline-flex min-h-12 items-center rounded-sm border border-line-strong px-4 font-semibold hover:bg-sunken"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => !stepError && setStep(step + 1)}
              aria-disabled={Boolean(stepError)}
              className="inline-flex min-h-12 items-center rounded-sm bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800 aria-disabled:bg-line-strong"
            >
              Next: {STEPS[step + 1]}
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              aria-disabled={Boolean(stepError)}
              className="inline-flex min-h-12 items-center rounded-sm bg-accent px-5 font-semibold text-white hover:bg-accent-strong aria-disabled:bg-line-strong"
            >
              Finish and make the pack
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

function PeopleEditor({ title, people, onChange, idPrefix, allowEmpty = false }: { title: string; people: Person[]; onChange: (p: Person[]) => void; idPrefix: string; allowEmpty?: boolean }) {
  const set = (i: number, patch: Partial<Person>) => onChange(people.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{title}</legend>
      <ul className="space-y-2">
        {people.map((p, i) => (
          <li key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1.2fr_auto] sm:items-end">
            {(['name', 'role', 'contact'] as const).map((k) => (
              <div key={k} className={k === 'contact' ? 'col-span-2 sm:col-span-1' : ''}>
                <label htmlFor={`${idPrefix}-${i}-${k}`} className="mb-1 block text-xs font-semibold text-ink-muted capitalize">
                  {k}
                </label>
                <input id={`${idPrefix}-${i}-${k}`} value={p[k]} onChange={(e) => set(i, { [k]: e.target.value })} maxLength={80} className={inputClass} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => onChange(people.filter((_, j) => j !== i))}
              disabled={!allowEmpty && people.length === 1}
              className="col-span-2 inline-flex min-h-12 items-center justify-center gap-1 rounded-sm text-ink-muted hover:bg-sunken disabled:invisible sm:col-span-1"
            >
              <Trash2 className="size-4" aria-hidden />
              <span className="sm:sr-only">Remove {p.name || 'person'}</span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...people, blankPerson()])} className="mt-2 inline-flex min-h-12 items-center gap-1.5 rounded-sm border border-line-strong px-3 font-semibold hover:bg-sunken">
        <Plus className="size-4" aria-hidden />
        Add a person
      </button>
    </fieldset>
  )
}
