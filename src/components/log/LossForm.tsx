import { useState, type FormEvent } from 'react'
import { failureCauseOptions } from '../../data'
import { useLogs } from '../../hooks/useLogs'
import { useSiteBedCrop } from '../../hooks/useSiteBedCrop'
import { formatDate, todayISO } from '../../lib/dates'
import { focusFirstIssue, issueMessage, parseDecimal, type FieldIssue } from '../../lib/forms'
import { addLog, removeUserLog, type NewLog } from '../../lib/logStore'
import { cropName, findSite, getBed, siteName } from '../../lib/lookups'
import { plantsAliveInBed } from '../../lib/metrics'
import { notifySaved, notifyUndone } from '../../lib/notify'
import { setLastSiteId } from '../../lib/preferences'
import { checkDate, checkNumber } from '../../lib/validation'
import type { FailureCause } from '../../types'
import ChoiceGroup from './ChoiceGroup'
import DateField from './DateField'
import FormHeader from './FormHeader'
import NumberField from './NumberField'
import PhotoField, { type UploadedPhoto } from './PhotoField'
import SaveBar from './SaveBar'
import SavedConfirmation from './SavedConfirmation'
import SiteBedCropFields from './SiteBedCropFields'
import TextAreaField from './TextAreaField'

const ID = {
  site: 'loss-site',
  bed: 'loss-bed',
  crop: 'loss-crop',
  date: 'loss-date',
  cause: 'loss-cause',
  loss: 'loss-lost',
  inBed: 'loss-in-bed',
  recovered: 'loss-recovered',
  description: 'loss-description',
  photo: 'loss-photo',
}

/**
 * Plant losses: some plants in one bed lost ("3 of 20"), with any that later recovered. A partial
 * event, not a site failure. Remaining plants are shown as you type.
 */
export default function LossForm() {
  const loc = useSiteBedCrop({ autoFillCrop: true })
  const { logs } = useLogs()
  const [date, setDate] = useState(todayISO)
  const [cause, setCause] = useState<FailureCause | null>(null)
  const [loss, setLoss] = useState('')
  /** What was typed into "Out of"; null until typed, so it follows the bed's current plant count. */
  const [inBedTyped, setInBedTyped] = useState<string | null>(null)
  const [recovered, setRecovered] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<UploadedPhoto | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState<{ id: string; record: NewLog<'failures'> } | null>(null)
  const [undone, setUndone] = useState(false)

  const lossPlants = parseDecimal(loss)
  const recoveredPlants = recovered.trim() === '' ? 0 : parseDecimal(recovered)
  const site = findSite(loc.siteId || undefined)
  const aliveNow = site && loc.bedId ? plantsAliveInBed(logs, site, loc.bedId) : null
  // "Out of" starts as the bed's current plant count, until it's typed over.
  const inBed = inBedTyped ?? (aliveNow === null ? '' : String(aliveNow))
  const inBedPlants = parseDecimal(inBed)

  const remaining =
    inBedPlants !== null && lossPlants !== null && recoveredPlants !== null
      ? Math.max(0, inBedPlants - lossPlants + recoveredPlants)
      : null

  const issues: FieldIssue[] = []
  if (!loc.siteId) issues.push({ id: ID.site, short: 'site', message: 'Choose the site.' })
  if (!loc.bedId) issues.push({ id: ID.bed, short: 'bed', message: 'Choose the bed.' })
  if (!loc.cropId) issues.push({ id: ID.crop, short: 'crop', message: 'Choose the crop.' })
  const dateError = checkDate(date)
  if (dateError) issues.push({ id: ID.date, short: 'date', message: dateError })
  if (!cause) issues.push({ id: ID.cause, short: 'cause', message: 'Choose the cause — pick Unknown if unsure.' })
  const lossError = checkNumber(lossPlants, { what: 'plants lost', max: 1000, unit: 'plants', whole: true })
  if (lossError) issues.push({ id: ID.loss, short: 'plants lost', message: lossError })
  const inBedError = checkNumber(inBedPlants, { what: 'plants in the bed', max: 5000, unit: 'plants', whole: true })
  if (inBedError) issues.push({ id: ID.inBed, short: 'plants in bed', message: inBedError })
  else if (lossPlants !== null && inBedPlants !== null && lossPlants > inBedPlants)
    issues.push({ id: ID.loss, short: 'plants lost', message: `Can't lose more than the ${inBedPlants} plants in the bed.` })
  if (recoveredPlants === null || recoveredPlants < 0 || !Number.isInteger(recoveredPlants))
    issues.push({ id: ID.recovered, short: 'recovered', message: 'Enter a whole number of plants, or leave it empty.' })
  else if (lossPlants !== null && recoveredPlants > lossPlants)
    issues.push({ id: ID.recovered, short: 'recovered', message: 'Recovered plants can’t be more than the plants lost.' })
  if (!description.trim())
    issues.push({ id: ID.description, short: 'description', message: 'Describe what happened.' })

  const err = (id: string) => issueMessage(issues, id, showErrors)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (issues.length > 0) {
      setShowErrors(true)
      focusFirstIssue(issues)
      return
    }
    if (!loc.siteId || !loc.cropId || !cause || lossPlants === null || inBedPlants === null) return

    const record: NewLog<'failures'> = {
      siteId: loc.siteId,
      bedId: loc.bedId,
      cropId: loc.cropId,
      date,
      cause,
      estimatedLossPlants: lossPlants,
      plantsInBed: inBedPlants,
      recoveredPlants: recoveredPlants || undefined,
      description: description.trim(),
      photo: photo ?? undefined,
    }
    const result = addLog('failures', record)
    if (!result.ok) {
      setSaveError(result.error)
      return
    }
    setLastSiteId(loc.siteId)
    setSaveError(null)
    setUndone(false)
    notifySaved('Loss')
    setSaved({ id: result.id, record })
  }

  const logAnother = () => {
    loc.resetBedAndCrop()
    setDate(todayISO())
    setCause(null)
    setLoss('')
    setInBedTyped(null)
    setRecovered('')
    setDescription('')
    setPhoto(null)
    setShowErrors(false)
    setSaved(null)
  }

  if (saved) {
    const r = saved.record
    return (
      <SavedConfirmation
        title="Loss saved"
        rows={[
          ['Site', siteName(r.siteId)],
          ['Bed', getBed(r.siteId, r.bedId)?.label ?? r.bedId],
          ['Crop', cropName(r.cropId)],
          ['Cause', failureCauseOptions.find((c) => c.value === r.cause)?.label ?? r.cause],
          ['Plants lost', `${r.estimatedLossPlants} of ${r.plantsInBed ?? '?'}`],
          ['Recovered', String(r.recoveredPlants ?? 0)],
          ['Remaining', String(Math.max(0, (r.plantsInBed ?? 0) - r.estimatedLossPlants + (r.recoveredPlants ?? 0)))],
          ['Date', formatDate(r.date)],
          ['Description', r.description],
        ]}
        photoUrl={photo?.dataUrl}
        anotherLabel="Log another loss"
        onAnother={logAnother}
        onUndo={() => {
          removeUserLog('failures', saved.id)
          setSaved(null)
          setUndone(true)
          notifyUndone('Loss')
        }}
      />
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-3">
      <FormHeader
        title="Log plant losses"
        aside={<DateField id={ID.date} value={date} onChange={setDate} error={err(ID.date)} />}
        undoneMessage={undone ? 'Loss removed. Your entries are still here — change anything and save again.' : null}
      />
      <SiteBedCropFields
        prefix="loss"
        state={loc}
        errors={{ site: err(ID.site), bed: err(ID.bed), crop: err(ID.crop) }}
      />
      <ChoiceGroup
        id={ID.cause}
        legend="Cause"
        choices={failureCauseOptions}
        value={cause}
        onChange={setCause}
        columnsClass="grid-cols-4"
        error={err(ID.cause)}
      />
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          id={ID.loss}
          label="Plants lost"
          value={loss}
          onChange={setLoss}
          step={1}
          decimals={0}
          unit=""
          error={err(ID.loss)}
        />
        <NumberField
          id={ID.inBed}
          label="Out of (in the bed)"
          value={inBed}
          onChange={setInBedTyped}
          step={1}
          decimals={0}
          unit=""
          hint={aliveNow !== null && inBedTyped === null ? 'Plants growing there now' : undefined}
          error={err(ID.inBed)}
        />
      </div>
      <NumberField
        id={ID.recovered}
        label="Recovered later (optional)"
        value={recovered}
        onChange={setRecovered}
        step={1}
        decimals={0}
        unit="plants"
        hint="Plants that came back are added back to the bed."
        error={err(ID.recovered)}
      />
      <p className="rounded-sm bg-sunken px-3 py-2 text-sm" aria-live="polite">
        {remaining === null ? (
          'Enter plants lost and how many were in the bed to see what remains.'
        ) : (
          <>
            <span className="font-semibold tabular-nums">{remaining}</span> plants remain in this bed after this loss.
          </>
        )}
      </p>
      <TextAreaField
        id={ID.description}
        label="Description"
        value={description}
        onChange={setDescription}
        placeholder="What did you see, and what have you done so far?"
        error={err(ID.description)}
      />
      <PhotoField id={ID.photo} value={photo} onChange={setPhoto} />
      <SaveBar label="Save loss" missing={issues.map((i) => i.short)} error={saveError} />
    </form>
  )
}
