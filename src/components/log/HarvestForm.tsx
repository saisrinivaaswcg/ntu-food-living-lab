import { useState, type FormEvent } from 'react'
import { destinationOptions } from '../../data'
import { useSiteBedCrop } from '../../hooks/useSiteBedCrop'
import { formatDate, todayISO } from '../../lib/dates'
import { focusFirstIssue, issueMessage, parseDecimal, type FieldIssue } from '../../lib/forms'
import { addLog, removeUserLog, type NewLog } from '../../lib/logStore'
import { cropName, getBed, siteName } from '../../lib/lookups'
import { notifySaved, notifyUndone } from '../../lib/notify'
import { setLastSiteId } from '../../lib/preferences'
import { checkDate, checkNumber } from '../../lib/validation'
import type { HarvestDestination } from '../../types'
import ChoiceGroup from './ChoiceGroup'
import DateField from './DateField'
import FormHeader from './FormHeader'
import NumberField from './NumberField'
import PhotoField, { type UploadedPhoto } from './PhotoField'
import SaveBar from './SaveBar'
import SavedConfirmation from './SavedConfirmation'
import SiteBedCropFields from './SiteBedCropFields'
import TextAreaField from './TextAreaField'

const LABOUR_CHIPS = [0.25, 0.5, 0.75, 1, 1.5, 2]
const labourChoices = LABOUR_CHIPS.map((h) => ({ value: h, label: String(h) }))
const destinationChoices = destinationOptions.map(({ value, label }) => ({ value, label }))

const ID = {
  site: 'harvest-site',
  bed: 'harvest-bed',
  crop: 'harvest-crop',
  date: 'harvest-date',
  weight: 'harvest-weight',
  destination: 'harvest-destination',
  labour: 'harvest-labour',
  photo: 'harvest-photo',
  notes: 'harvest-notes',
}

/** The priority form: built to be finished in under a minute, one-handed, outdoors. */
export default function HarvestForm() {
  const loc = useSiteBedCrop({ autoFillCrop: true })
  const [date, setDate] = useState(todayISO)
  const [weight, setWeight] = useState('')
  const [destination, setDestination] = useState<HarvestDestination | null>(null)
  const [labour, setLabour] = useState<number | null>(null)
  const [photo, setPhoto] = useState<UploadedPhoto | null>(null)
  const [notes, setNotes] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState<{ id: string; record: NewLog<'harvests'> } | null>(null)
  const [undone, setUndone] = useState(false)

  const weightKg = parseDecimal(weight)

  const issues: FieldIssue[] = []
  if (!loc.siteId) issues.push({ id: ID.site, short: 'site', message: 'Choose the site.' })
  if (!loc.bedId) issues.push({ id: ID.bed, short: 'bed', message: 'Choose the bed.' })
  if (!loc.cropId) issues.push({ id: ID.crop, short: 'crop', message: 'Choose the crop.' })
  const dateError = checkDate(date)
  if (dateError) issues.push({ id: ID.date, short: 'date', message: dateError })
  const weightError = checkNumber(weightKg, { what: 'weight', max: 50, unit: 'kg' })
  if (weightError) issues.push({ id: ID.weight, short: 'weight', message: weightError })
  if (!destination) issues.push({ id: ID.destination, short: 'destination', message: 'Choose where the harvest went.' })
  if (labour === null) issues.push({ id: ID.labour, short: 'labour', message: 'Choose how long it took.' })
  if (!photo) issues.push({ id: ID.photo, short: 'photo', message: 'Take a photo of the harvest — every harvest needs one.' })

  const err = (id: string) => issueMessage(issues, id, showErrors)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (issues.length > 0) {
      setShowErrors(true)
      focusFirstIssue(issues)
      return
    }
    // Narrowing for TypeScript — issues above already guarantee these.
    if (!loc.siteId || !loc.cropId || weightKg === null || !destination || labour === null || !photo) return

    const record: NewLog<'harvests'> = {
      siteId: loc.siteId,
      bedId: loc.bedId,
      cropId: loc.cropId,
      date,
      weightKg,
      destination,
      labourHours: labour,
      photo,
      notes: notes.trim() || undefined,
    }
    const result = addLog('harvests', record)
    if (!result.ok) {
      setSaveError(result.error)
      return
    }
    setLastSiteId(loc.siteId)
    setSaveError(null)
    setUndone(false)
    notifySaved('Harvest')
    setSaved({ id: result.id, record })
  }

  const logAnother = () => {
    loc.resetBedAndCrop()
    setDate(todayISO())
    setWeight('')
    setDestination(null)
    setLabour(null)
    setPhoto(null)
    setNotes('')
    setShowErrors(false)
    setSaved(null)
  }

  if (saved) {
    const r = saved.record
    return (
      <SavedConfirmation
        title="Harvest saved"
        rows={[
          ['Site', siteName(r.siteId)],
          ['Bed', getBed(r.siteId, r.bedId)?.label ?? r.bedId],
          ['Crop', cropName(r.cropId)],
          ['Weight', `${r.weightKg} kg`],
          ['Went to', destinationOptions.find((d) => d.value === r.destination)?.label ?? r.destination],
          ['Labour', `${r.labourHours} h`],
          ['Date', formatDate(r.date)],
        ]}
        photoUrl={photo?.dataUrl}
        anotherLabel="Log another harvest"
        onAnother={logAnother}
        onUndo={() => {
          removeUserLog('harvests', saved.id)
          setSaved(null)
          setUndone(true)
          notifyUndone('Harvest')
        }}
      />
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-3">
      <FormHeader
        title="Log a harvest"
        aside={<DateField id={ID.date} value={date} onChange={setDate} error={err(ID.date)} />}
        undoneMessage={undone ? 'Harvest removed. Your entries are still here — change anything and save again.' : null}
      />
      <SiteBedCropFields
        prefix="harvest"
        state={loc}
        errors={{ site: err(ID.site), bed: err(ID.bed), crop: err(ID.crop) }}
      />
      <NumberField
        id={ID.weight}
        label="Weight"
        value={weight}
        onChange={setWeight}
        step={0.05}
        decimals={2}
        unit="kg"
        large
        error={err(ID.weight)}
      />
      <ChoiceGroup
        id={ID.destination}
        legend="Went to"
        choices={destinationChoices}
        value={destination}
        onChange={setDestination}
        columnsClass="grid-cols-4"
        error={err(ID.destination)}
      />
      <ChoiceGroup
        id={ID.labour}
        legend="Labour hours (harvest, wash, pack)"
        choices={labourChoices}
        value={labour}
        onChange={setLabour}
        columnsClass="grid-cols-6"
        error={err(ID.labour)}
      />
      <PhotoField id={ID.photo} value={photo} onChange={setPhoto} required error={err(ID.photo)} />
      <TextAreaField
        id={ID.notes}
        label="Notes"
        optional
        value={notes}
        onChange={setNotes}
        placeholder="e.g. leaves a little yellow at the tips"
      />
      <SaveBar label="Save harvest" missing={issues.map((i) => i.short)} error={saveError} />
    </form>
  )
}
