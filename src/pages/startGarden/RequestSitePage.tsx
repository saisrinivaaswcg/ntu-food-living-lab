import { Clock, MapPin, Plus, Trash2 } from 'lucide-react'
import { lazy, Suspense, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import RoleGate from '../../components/access/RoleGate'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import ChoiceGroup from '../../components/log/ChoiceGroup'
import Field from '../../components/log/Field'
import PhotoField, { type UploadedPhoto } from '../../components/log/PhotoField'
import SelectField from '../../components/log/SelectField'
import TextAreaField from '../../components/log/TextAreaField'
import EmptyState from '../../components/ui/EmptyState'
import { contactMethodOptions, DEMO_LOGIN_NOTICE, halls } from '../../data'
import { useCommunity } from '../../hooks/useCommunity'
import { usePageTitle } from '../../hooks/usePageTitle'
import { requestSite, withdrawSiteRequest } from '../../lib/communityStore'
import { formatDate, toISODate } from '../../lib/dates'
import { focusFirstIssue, inputClass, issueMessage, parseDecimal, type FieldIssue } from '../../lib/forms'
import { notifyChange, notifyError } from '../../lib/notify'
import { paths } from '../../lib/paths'
import type { ContactMethod, SiteRequest } from '../../types'

const PinPicker = lazy(() => import('../../components/sites/PinPicker'))

const hallOptions = halls.map((h) => ({ value: h, label: h }))

const STATUS: Record<SiteRequest['status'], string> = {
  pending: 'Waiting for the Sustainability Office',
  approved: 'Approved: on the map and in the Hall Cup',
  declined: 'Not approved',
}

/** Request a new hall site (students and committees). Pending until Admin approves it. */
export default function RequestSitePage() {
  usePageTitle('Request a hall site')
  const { siteRequests } = useCommunity()

  return (
    <div className="mx-auto max-w-4xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Start a garden', to: paths.startGarden }, { label: 'Request a site' }]} />
      <RoleGate
        allow={['student', 'committee', 'admin']}
        what="Requesting a hall site"
        why="A request needs someone the Sustainability Office can contact: a student or a site committee."
      >
        <h1 className="font-display text-display font-medium">Request a hall site</h1>
        <p className="mt-3 text-lg text-ink-muted">
          Tell the Sustainability Office where your garden will be and what you’ll build. Once approved it goes on the
          map and into the Hall Garden Cup.
        </p>
        <p className="mt-2 text-sm text-demo">{DEMO_LOGIN_NOTICE} Requests are saved in this browser only.</p>

        <RequestForm />

        <section aria-labelledby="mine-heading" className="mt-14">
          <h2 id="mine-heading" className="font-display text-section font-medium">
            Your requests
          </h2>
          {siteRequests.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No requests yet" detail="Your request and its status show here after you send it." />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {siteRequests.map((r) => (
                <li key={r.id} className="rounded-card bg-surface p-4 shadow-card">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold">
                      {r.name} <span className="font-normal text-ink-muted">· {r.hall}</span>
                    </h3>
                    <span className={`text-sm font-semibold ${r.status === 'approved' ? 'text-brand-700' : r.status === 'declined' ? 'text-danger' : 'text-demo'}`}>
                      {STATUS[r.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    Sent {formatDate(toISODate(new Date(r.createdAt)))} · {r.beds.length} {r.beds.length === 1 ? 'bed' : 'beds'} ·{' '}
                    {r.beds.reduce((n, b) => n + b.areaSqm, 0)} m²
                  </p>
                  {r.decisionNote && <p className="mt-1 text-sm">“{r.decisionNote}”</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.status === 'approved' && r.siteId && (
                      <>
                        <Link to={paths.site(r.siteId)} className="inline-flex min-h-12 items-center font-semibold text-brand-700 underline underline-offset-4">
                          Site page
                        </Link>
                        <Link to={paths.hallCup} className="inline-flex min-h-12 items-center px-2 font-semibold text-brand-700 underline underline-offset-4">
                          Hall Cup
                        </Link>
                      </>
                    )}
                    {r.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => {
                          withdrawSiteRequest(r.id)
                          notifyChange('Request withdrawn')
                        }}
                        className="inline-flex min-h-12 items-center font-semibold text-ink-muted underline underline-offset-4"
                      >
                        Withdraw request
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </RoleGate>
    </div>
  )
}

interface BedDraft {
  label: string
  area: string
}

function RequestForm() {
  const { profile, role } = useCommunity()
  const [hall, setHall] = useState(profile?.hall && halls.includes(profile.hall) ? profile.hall : '')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const latN = parseDecimal(lat)
  const lngN = parseDecimal(lng)
  const pin: [number, number] | null = latN !== null && lngN !== null ? [latN, lngN] : null
  const setPin = (p: [number, number] | null) => {
    setLat(p ? String(p[0]) : '')
    setLng(p ? String(p[1]) : '')
  }
  const [locationNote, setLocationNote] = useState('')
  const [beds, setBeds] = useState<BedDraft[]>([{ label: 'Planter box 1', area: '1.5' }])
  const [requesterName, setRequesterName] = useState(profile?.name ?? '')
  const [contactMethod, setContactMethod] = useState<ContactMethod>(profile?.contactMethod ?? 'email')
  const [contact, setContact] = useState(profile?.contact ?? '')
  const [photo, setPhoto] = useState<UploadedPhoto | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [sent, setSent] = useState(false)

  const method = contactMethodOptions.find((o) => o.value === contactMethod) ?? contactMethodOptions[0]
  const parsedBeds = beds.map((b) => ({ label: b.label.trim(), areaSqm: parseDecimal(b.area) }))
  const issues: FieldIssue[] = []
  if (!hall) issues.push({ id: 'req-hall', short: 'hall', message: 'Choose the hall.' })
  if (!name.trim()) issues.push({ id: 'req-name', short: 'name', message: 'Give the garden a name, e.g. “Hall 5 Rooftop Herbs”.' })
  if (!pin) issues.push({ id: 'req-lat', short: 'map pin', message: 'Tap the map where the garden will be (or type the coordinates).' })
  else if (pin[0] < 1.15 || pin[0] > 1.48 || pin[1] < 103.6 || pin[1] > 104.1) issues.push({ id: 'req-lat', short: 'map pin', message: 'That point isn’t in Singapore. Tap the map on campus.' })
  if (parsedBeds.length === 0 || parsedBeds.some((b) => !b.label || b.areaSqm === null || b.areaSqm <= 0 || b.areaSqm > 200)) {
    issues.push({ id: 'req-bed-0-label', short: 'beds', message: 'Each bed needs a name and an area between 0.1 and 200 m².' })
  }
  if (!requesterName.trim()) issues.push({ id: 'req-person', short: 'your name', message: 'Add your name.' })
  if (!contact.trim()) issues.push({ id: 'req-contact', short: 'contact', message: `Add your ${method.label.toLowerCase()}.` })

  function submit(e: FormEvent) {
    e.preventDefault()
    if (issues.length > 0 || !pin) {
      setShowErrors(true)
      focusFirstIssue(issues)
      return
    }
    const result = requestSite({
      hall,
      name: name.trim(),
      description: description.trim() || `A new hall garden at ${hall}.`,
      coordinates: pin,
      locationNote: locationNote.trim() || `${hall}`,
      beds: parsedBeds.map((b) => ({ label: b.label, areaSqm: b.areaSqm ?? 0 })),
      requesterName: requesterName.trim(),
      requesterRole: role.kind,
      contactMethod,
      contact: contact.trim(),
      photo: photo ?? undefined,
    })
    if (!result.ok) {
      notifyError(result.error)
      return
    }
    notifyChange('Request sent', undefined, 'The Sustainability Office will review it.')
    setSent(true)
    setName('')
    setDescription('')
    setPin(null)
    setLocationNote('')
    setPhoto(null)
    setShowErrors(false)
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8 space-y-8">
      {sent && (
        <p role="status" className="flex items-start gap-2 rounded-sm bg-brand-50 px-4 py-3 text-brand-800">
          <Clock className="mt-0.5 size-5 shrink-0" aria-hidden />
          Sent. It stays pending until the Sustainability Office approves it; you can follow it below or send another.
        </p>
      )}

      <fieldset className="space-y-4 rounded-card bg-surface p-5 shadow-card">
        <legend className="font-display text-2xl font-medium">The garden</legend>
        <SelectField id="req-hall" label="Hall" value={hall} onChange={setHall} options={hallOptions} placeholder="Choose the hall" error={issueMessage(issues, 'req-hall', showErrors)} />
        <Field id="req-name" label="Garden name" error={issueMessage(issues, 'req-name', showErrors)}>
          <input id="req-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="e.g. Hall 5 Rooftop Herbs" className={inputClass} />
        </Field>
        <TextAreaField id="req-description" label="What you’d like to grow, and who’s in the team" optional value={description} onChange={setDescription} />
      </fieldset>

      <fieldset className="space-y-4 rounded-card bg-surface p-5 shadow-card">
        <legend className="font-display text-2xl font-medium">Where it is</legend>
        <p className="flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin className="size-4" aria-hidden />
          Tap the map to drop a pin; drag it to adjust. Or type the coordinates.
        </p>
        <Suspense fallback={<div className="h-72 animate-pulse rounded-sm bg-sunken sm:h-96" aria-label="Loading map" />}>
          <PinPicker value={pin} onChange={setPin} />
        </Suspense>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="req-lat" label="Latitude" error={issueMessage(issues, 'req-lat', showErrors)}>
            <input id="req-lat" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="1.3472" className={inputClass} />
          </Field>
          <Field id="req-lng" label="Longitude">
            <input id="req-lng" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="103.6833" className={inputClass} />
          </Field>
        </div>
        <Field id="req-where" label="How to find it" optional>
          <input id="req-where" value={locationNote} onChange={(e) => setLocationNote(e.target.value)} maxLength={120} placeholder="e.g. Block 3 roof terrace" className={inputClass} />
        </Field>
      </fieldset>

      <fieldset className="space-y-3 rounded-card bg-surface p-5 shadow-card">
        <legend className="font-display text-2xl font-medium">Beds</legend>
        {issueMessage(issues, 'req-bed-0-label', showErrors) && <p className="text-sm font-medium text-danger">{issueMessage(issues, 'req-bed-0-label', true)}</p>}
        <ul className="space-y-2">
          {beds.map((b, i) => (
            <li key={i} className="grid grid-cols-[1fr_6.5rem_auto] items-end gap-2">
              <Field id={`req-bed-${i}-label`} label={`Bed ${i + 1} name`}>
                <input
                  id={`req-bed-${i}-label`}
                  value={b.label}
                  onChange={(e) => setBeds(beds.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  maxLength={60}
                  className={inputClass}
                />
              </Field>
              <Field id={`req-bed-${i}-area`} label="Area (m²)">
                <input
                  id={`req-bed-${i}-area`}
                  inputMode="decimal"
                  value={b.area}
                  onChange={(e) => setBeds(beds.map((x, j) => (j === i ? { ...x, area: e.target.value } : x)))}
                  className={inputClass}
                />
              </Field>
              <button
                type="button"
                onClick={() => setBeds(beds.filter((_, j) => j !== i))}
                disabled={beds.length === 1}
                className="inline-flex size-12 items-center justify-center rounded-sm text-ink-muted hover:bg-sunken disabled:invisible"
              >
                <Trash2 className="size-4" aria-hidden />
                <span className="sr-only">Remove bed {i + 1}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setBeds([...beds, { label: `Planter box ${beds.length + 1}`, area: '1.5' }])}
          className="inline-flex min-h-12 items-center gap-1.5 rounded-sm border border-line-strong px-3 font-semibold hover:bg-sunken"
        >
          <Plus className="size-4" aria-hidden />
          Add a bed
        </button>
        <p className="text-sm text-ink-muted">
          Total {parsedBeds.reduce((n, b) => n + (b.areaSqm ?? 0), 0).toFixed(1)} m². Not sure? See the bed sizes on{' '}
          <Link to={paths.startGarden} className="font-semibold underline underline-offset-4">
            Start a garden
          </Link>
          .
        </p>
      </fieldset>

      <fieldset className="space-y-4 rounded-card bg-surface p-5 shadow-card">
        <legend className="font-display text-2xl font-medium">Contact and photo</legend>
        <Field id="req-person" label="Your name" error={issueMessage(issues, 'req-person', showErrors)}>
          <input id="req-person" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} maxLength={80} autoComplete="name" className={inputClass} />
        </Field>
        <ChoiceGroup
          id="req-method"
          legend="Best way to reach you"
          choices={contactMethodOptions.map((o) => ({ value: o.value, label: o.label }))}
          value={contactMethod}
          onChange={setContactMethod}
          columnsClass="grid-cols-3"
        />
        <Field id="req-contact" label={method.label} error={issueMessage(issues, 'req-contact', showErrors)}>
          <input id="req-contact" value={contact} onChange={(e) => setContact(e.target.value)} inputMode={method.inputMode} placeholder={method.placeholder} maxLength={120} className={inputClass} />
        </Field>
        <div>
          <p className="mb-1 text-sm font-semibold">
            Photo of the spot <span className="font-normal text-ink-muted">(optional)</span>
          </p>
          <PhotoField id="req-photo" value={photo} onChange={setPhoto} />
        </div>
      </fieldset>

      <div>
        <button type="submit" className="flex min-h-12 w-full items-center justify-center rounded-sm bg-accent px-6 font-semibold text-white hover:bg-accent-strong sm:w-auto">
          Send request
        </button>
        {showErrors && issues.length > 0 && <p className="mt-2 text-sm text-danger">Still needed: {issues.map((i) => i.short).join(', ')}</p>}
      </div>
    </form>
  )
}
