import { useState, type FormEvent } from 'react'
import { failureCauseOptions } from '../../data'
import { useSiteBedCrop } from '../../hooks/useSiteBedCrop'
import { formatDate, todayISO } from '../../lib/dates'
import { focusFirstIssue, issueMessage, parseDecimal, type FieldIssue } from '../../lib/forms'
import { addLog, removeUserLog, type NewLog } from '../../lib/logStore'
import { cropName, getBed, siteName } from '../../lib/lookups'
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
  site: 'failure-site',
  bed: 'failure-bed',
  crop: 'failure-crop',
  date: 'failure-date',
  cause: 'failure-cause',
  loss: 'failure-loss',
  description: 'failure-description',
  photo: 'failure-photo',
}

export default function FailureForm() {
  const loc = useSiteBedCrop({ autoFillCrop: true })
  const [date, setDate] = useState(todayISO)
  const [cause, setCause] = useState<FailureCause | null>(null)
  const [loss, setLoss] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<UploadedPhoto | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState<{ id: string; record: NewLog<'failures'> } | null>(null)
  const [undone, setUndone] = useState(false)

  const lossPlants = parseDecimal(loss)
  const planting = loc.currentPlanting
  const plantedHint =
    planting && planting.cropId === loc.cropId
      ? `Out of ${planting.quantity} planted on ${formatDate(planting.date)}`
      : 'Plants lost, in the same unit as the planting quantity'

  const issues: FieldIssue[] = []
  if (!loc.siteId) issues.push({ id: ID.site, short: 'site', message: 'Choose the site.' })
  if (!loc.bedId) issues.push({ id: ID.bed, short: 'bed', message: 'Choose the bed.' })
  if (!loc.cropId) issues.push({ id: ID.crop, short: 'crop', message: 'Choose the crop.' })
  const dateError = checkDate(date)
  if (dateError) issues.push({ id: ID.date, short: 'date', message: dateError })
  if (!cause) issues.push({ id: ID.cause, short: 'cause', message: 'Choose the cause — pick Unknown if unsure.' })
  const lossError = checkNumber(lossPlants, { what: 'estimated loss', max: 1000, unit: 'plants', whole: true })
  if (lossError) issues.push({ id: ID.loss, short: 'plants lost', message: lossError })
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
    if (!loc.siteId || !loc.cropId || !cause || lossPlants === null) return

    const record: NewLog<'failures'> = {
      siteId: loc.siteId,
      bedId: loc.bedId,
      cropId: loc.cropId,
      date,
      cause,
      estimatedLossPlants: lossPlants,
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
    setDescription('')
    setPhoto(null)
    setShowErrors(false)
    setSaved(null)
  }

  if (saved) {
    const r = saved.record
    return (
      <SavedConfirmation
        title="Failure saved"
        rows={[
          ['Site', siteName(r.siteId)],
          ['Bed', getBed(r.siteId, r.bedId)?.label ?? r.bedId],
          ['Crop', cropName(r.cropId)],
          ['Cause', failureCauseOptions.find((c) => c.value === r.cause)?.label ?? r.cause],
          ['Plants lost', String(r.estimatedLossPlants)],
          ['Date', formatDate(r.date)],
          ['Description', r.description],
        ]}
        photoUrl={photo?.dataUrl}
        anotherLabel="Log another failure"
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
        title="Log a failure"
        aside={<DateField id={ID.date} value={date} onChange={setDate} error={err(ID.date)} />}
        undoneMessage={undone ? 'Failure removed. Your entries are still here — change anything and save again.' : null}
      />
      <SiteBedCropFields
        prefix="failure"
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
      <NumberField
        id={ID.loss}
        label="Estimated loss"
        value={loss}
        onChange={setLoss}
        step={1}
        decimals={0}
        unit="plants"
        hint={plantedHint}
        error={err(ID.loss)}
      />
      <TextAreaField
        id={ID.description}
        label="Description"
        value={description}
        onChange={setDescription}
        placeholder="What did you see, and what have you done so far?"
        error={err(ID.description)}
      />
      <PhotoField id={ID.photo} value={photo} onChange={setPhoto} />
      <SaveBar label="Save failure" missing={issues.map((i) => i.short)} error={saveError} />
    </form>
  )
}
