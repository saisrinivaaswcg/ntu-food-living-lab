import { Check, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { contactMethodOptions, halls, JOIN_PRIVACY_NOTE, NO_HALL } from '../../data'
import { useCommunity } from '../../hooks/useCommunity'
import { ANY_ROLE } from '../../lib/community'
import { joinCommunity } from '../../lib/communityStore'
import { describedBy, focusFirstIssue, inputClass, issueMessage, type FieldIssue } from '../../lib/forms'
import { notifyChange, notifyError } from '../../lib/notify'
import type { ContactMethod, SiteCommunity, Site } from '../../types'
import ChoiceGroup from '../log/ChoiceGroup'
import Field from '../log/Field'
import SelectField from '../log/SelectField'
import TextAreaField from '../log/TextAreaField'

interface Props {
  site: Site
  community: SiteCommunity
  /** A role picked from the open-roles list before the form */
  initialRoleId?: string
  onJoined: () => void
}

const hallOptions = [...halls, NO_HALL].map((h) => ({ value: h, label: h }))

/**
 * "Join this community": name, hall, how to reach you, the role you'd like and consent. Saving creates
 * or updates the student profile and puts the request in the site's Interest inbox.
 */
export default function JoinForm({ site, community, initialRoleId, onJoined }: Props) {
  const { profile } = useCommunity()
  const [name, setName] = useState(profile?.name ?? '')
  const [hall, setHall] = useState(profile?.hall ?? '')
  const [contactMethod, setContactMethod] = useState<ContactMethod>(profile?.contactMethod ?? 'telegram')
  const [contact, setContact] = useState(profile?.contact ?? '')
  const [roleId, setRoleId] = useState(initialRoleId ?? community.roles[0]?.id ?? ANY_ROLE.id)
  const [note, setNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const method = contactMethodOptions.find((o) => o.value === contactMethod) ?? contactMethodOptions[0]
  const issues: FieldIssue[] = []
  if (!name.trim()) issues.push({ id: 'join-name', short: 'name', message: 'Add your name so the committee knows who to welcome.' })
  if (!hall) issues.push({ id: 'join-hall', short: 'hall', message: 'Choose your hall, or “Not in a hall”.' })
  if (!contact.trim()) issues.push({ id: 'join-contact', short: 'contact', message: `Add your ${method.label.toLowerCase()} so they can reach you.` })
  if (!consent) issues.push({ id: 'join-consent', short: 'consent', message: 'Tick this so the committee may contact you.' })

  function submit(e: FormEvent) {
    e.preventDefault()
    if (issues.length > 0) {
      setShowErrors(true)
      focusFirstIssue(issues)
      return
    }
    const result = joinCommunity({
      siteId: site.id,
      name: name.trim(),
      hall,
      contactMethod,
      contact: contact.trim(),
      roleId,
      note: note.trim() || undefined,
      consent,
    })
    if (!result.ok) {
      notifyError(result.error)
      return
    }
    notifyChange(`You asked to join ${site.shortName}`, undefined, 'The committee will message you before the next workday.')
    onJoined()
  }

  const roleChoices = [...community.roles, ANY_ROLE]

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field id="join-name" label="Your name" error={issueMessage(issues, 'join-name', showErrors)}>
        <input
          id="join-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={80}
          aria-invalid={showErrors && !name.trim() ? true : undefined}
          aria-describedby={describedBy('join-name', undefined, issueMessage(issues, 'join-name', showErrors))}
          className={inputClass}
        />
      </Field>

      <SelectField
        id="join-hall"
        label="Hall"
        value={hall}
        onChange={setHall}
        options={hallOptions}
        placeholder="Choose your hall"
        error={issueMessage(issues, 'join-hall', showErrors)}
      />

      <div className="space-y-2">
        <ChoiceGroup
          id="join-method"
          legend="Best way to reach you"
          choices={contactMethodOptions.map((o) => ({ value: o.value, label: o.label }))}
          value={contactMethod}
          onChange={setContactMethod}
          columnsClass="grid-cols-3"
        />
        <Field id="join-contact" label={method.label} error={issueMessage(issues, 'join-contact', showErrors)}>
          <input
            id="join-contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            inputMode={method.inputMode}
            type={contactMethod === 'email' ? 'email' : 'text'}
            placeholder={method.placeholder}
            maxLength={120}
            aria-invalid={showErrors && !contact.trim() ? true : undefined}
            aria-describedby={describedBy('join-contact', undefined, issueMessage(issues, 'join-contact', showErrors))}
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">How you’d like to help</legend>
        <div className="space-y-1.5">
          {roleChoices.map((r) => (
            <label key={r.id} className="block cursor-pointer">
              <input
                type="radio"
                name="join-role"
                className="peer sr-only"
                checked={roleId === r.id}
                onChange={() => setRoleId(r.id)}
              />
              <span className="flex min-h-12 items-start gap-3 rounded-sm border border-line-strong bg-surface px-3 py-2.5 peer-checked:border-brand-700 peer-checked:bg-brand-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${roleId === r.id ? 'border-brand-700 bg-brand-700 text-white' : 'border-line-strong'}`}
                  aria-hidden
                >
                  {roleId === r.id && <Check className="size-3.5" />}
                </span>
                <span>
                  <span className="block font-semibold">{r.title}</span>
                  <span className="block text-sm text-ink-muted">{r.detail}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <TextAreaField
        id="join-note"
        label="Anything the committee should know"
        optional
        value={note}
        onChange={setNote}
        placeholder="e.g. free on weekday evenings, grew chillies at home"
      />

      <div>
        <label className="flex min-h-12 cursor-pointer items-start gap-3">
          <input
            id="join-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={showErrors && !consent ? true : undefined}
            aria-describedby="join-privacy"
            className="mt-0.5 size-6 shrink-0 accent-brand-700"
          />
          <span>
            The {site.shortName} committee may contact me about joining.
          </span>
        </label>
        {showErrors && !consent && (
          <p className="mt-1 text-sm font-medium text-danger">{issueMessage(issues, 'join-consent', true)}</p>
        )}
        <p id="join-privacy" className="mt-2 flex items-start gap-2 text-sm text-ink-muted">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden />
          {JOIN_PRIVACY_NOTE}
        </p>
      </div>

      <div>
        <button
          type="submit"
          className="flex min-h-12 w-full items-center justify-center rounded-sm bg-accent px-5 font-semibold text-white hover:bg-accent-strong sm:w-auto"
        >
          Join this community
        </button>
        {showErrors && issues.length > 0 && (
          <p className="mt-2 text-sm text-danger" role="status">
            Still needed: {issues.map((i) => i.short).join(', ')}
          </p>
        )}
      </div>
    </form>
  )
}
