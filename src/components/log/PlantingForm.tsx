import { useState, type FormEvent } from 'react'
import { propagationOptions } from '../../data'
import { useSiteBedCrop } from '../../hooks/useSiteBedCrop'
import { formatDate, todayISO } from '../../lib/dates'
import { focusFirstIssue, issueMessage, parseDecimal, type FieldIssue } from '../../lib/forms'
import { addLog, removeUserLog, type NewLog } from '../../lib/logStore'
import { cropName, getBed, siteName } from '../../lib/lookups'
import { setLastSiteId } from '../../lib/preferences'
import { checkDate, checkNumber } from '../../lib/validation'
import type { PropagationType } from '../../types'
import ChoiceGroup from './ChoiceGroup'
import DateField from './DateField'
import FormHeader from './FormHeader'
import NumberField from './NumberField'
import SaveBar from './SaveBar'
import SavedConfirmation from './SavedConfirmation'
import SiteBedCropFields from './SiteBedCropFields'
import TextAreaField from './TextAreaField'

const ID = {
  site: 'planting-site',
  bed: 'planting-bed',
  crop: 'planting-crop',
  date: 'planting-date',
  quantity: 'planting-quantity',
  propagation: 'planting-propagation',
  notes: 'planting-notes',
}

export default function PlantingForm() {
  // No crop auto-fill: a new planting usually replaces what's on the bed.
  const loc = useSiteBedCrop({ autoFillCrop: false })
  const [date, setDate] = useState(todayISO)
  const [quantity, setQuantity] = useState('')
  const [propagation, setPropagation] = useState<PropagationType | null>(null)
  const [notes, setNotes] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState<{ id: string; record: NewLog<'plantings'> } | null>(null)
  const [undone, setUndone] = useState(false)

  const qty = parseDecimal(quantity)
  const replacing = loc.currentPlanting

  const issues: FieldIssue[] = []
  if (!loc.siteId) issues.push({ id: ID.site, short: 'site', message: 'Choose the site.' })
  if (!loc.bedId) issues.push({ id: ID.bed, short: 'bed', message: 'Choose the bed.' })
  if (!loc.cropId) issues.push({ id: ID.crop, short: 'crop', message: 'Choose the crop.' })
  const dateError = checkDate(date)
  if (dateError) issues.push({ id: ID.date, short: 'date', message: dateError })
  const qtyError = checkNumber(qty, { what: 'quantity', max: 1000, unit: 'plants', whole: true })
  if (qtyError) issues.push({ id: ID.quantity, short: 'quantity', message: qtyError })
  if (!propagation) issues.push({ id: ID.propagation, short: 'propagation', message: 'Choose how it was propagated.' })

  const err = (id: string) => issueMessage(issues, id, showErrors)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (issues.length > 0) {
      setShowErrors(true)
      focusFirstIssue(issues)
      return
    }
    if (!loc.siteId || !loc.cropId || qty === null || !propagation) return

    const record: NewLog<'plantings'> = {
      siteId: loc.siteId,
      bedId: loc.bedId,
      cropId: loc.cropId,
      date,
      quantity: qty,
      propagation,
      notes: notes.trim() || undefined,
    }
    const result = addLog('plantings', record)
    if (!result.ok) {
      setSaveError(result.error)
      return
    }
    setLastSiteId(loc.siteId)
    setSaveError(null)
    setUndone(false)
    setSaved({ id: result.id, record })
  }

  const logAnother = () => {
    loc.resetBedAndCrop()
    setDate(todayISO())
    setQuantity('')
    setPropagation(null)
    setNotes('')
    setShowErrors(false)
    setSaved(null)
  }

  if (saved) {
    const r = saved.record
    return (
      <SavedConfirmation
        title="Planting saved"
        rows={[
          ['Site', siteName(r.siteId)],
          ['Bed', getBed(r.siteId, r.bedId)?.label ?? r.bedId],
          ['Crop', cropName(r.cropId)],
          ['Quantity', `${r.quantity} plants`],
          ['Propagation', propagationOptions.find((p) => p.value === r.propagation)?.label ?? r.propagation],
          ['Date', formatDate(r.date)],
        ]}
        anotherLabel="Log another planting"
        onAnother={logAnother}
        onUndo={() => {
          removeUserLog('plantings', saved.id)
          setSaved(null)
          setUndone(true)
        }}
      />
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-3">
      <FormHeader
        title="Log a planting"
        aside={<DateField id={ID.date} value={date} onChange={setDate} error={err(ID.date)} />}
        undoneMessage={undone ? 'Planting removed. Your entries are still here — change anything and save again.' : null}
      />
      <SiteBedCropFields
        prefix="planting"
        state={loc}
        errors={{ site: err(ID.site), bed: err(ID.bed), crop: err(ID.crop) }}
      />
      {replacing && (
        <p className="text-sm text-ink-muted">
          This bed currently has {cropName(replacing.cropId)} (planted {formatDate(replacing.date)}). Saving makes this
          the bed's current planting.
        </p>
      )}
      <NumberField
        id={ID.quantity}
        label="Quantity"
        value={quantity}
        onChange={setQuantity}
        step={1}
        decimals={0}
        unit="plants"
        hint="Seeds, cuttings or seedlings planted"
        error={err(ID.quantity)}
      />
      <ChoiceGroup
        id={ID.propagation}
        legend="Propagation"
        choices={propagationOptions}
        value={propagation}
        onChange={setPropagation}
        columnsClass="grid-cols-3"
        error={err(ID.propagation)}
      />
      <TextAreaField
        id={ID.notes}
        label="Notes"
        optional
        value={notes}
        onChange={setNotes}
        placeholder="e.g. seed source, spacing, soil mix"
      />
      <SaveBar label="Save planting" missing={issues.map((i) => i.short)} error={saveError} />
    </form>
  )
}
