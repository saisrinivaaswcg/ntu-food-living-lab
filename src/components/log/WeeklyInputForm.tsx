import { useMemo, useState, type FormEvent } from 'react'
import { compostOptions, demoLogs } from '../../data'
import { compostSummary } from '../../lib/format'
import { useLogs } from '../../hooks/useLogs'
import { formatDate, mondayOf, recentMondays, todayISO } from '../../lib/dates'
import { focusFirstIssue, issueMessage, parseDecimal, type FieldIssue } from '../../lib/forms'
import { addLog, removeUserLog, replaceUserLogs, undoReplaceUserLogs, type NewLog } from '../../lib/logStore'
import { siteName } from '../../lib/lookups'
import { getLastSiteId, setLastSiteId } from '../../lib/preferences'
import { checkNumber } from '../../lib/validation'
import type { CompostType, ISODate, SiteId, WeeklyInputLog } from '../../types'
import ChoiceGroup from './ChoiceGroup'
import ExistingWeekRecord from './ExistingWeekRecord'
import FormHeader from './FormHeader'
import NumberField from './NumberField'
import SaveBar from './SaveBar'
import SavedConfirmation from './SavedConfirmation'
import SelectField from './SelectField'
import SiteSelect from './SiteSelect'
import TextAreaField from './TextAreaField'

const WEEKS_TO_OFFER = 12

const ID = {
  site: 'weekly-site',
  week: 'weekly-week',
  water: 'weekly-water',
  compostType: 'weekly-compost-type',
  compostKg: 'weekly-compost-kg',
  labour: 'weekly-labour',
  notes: 'weekly-notes',
}

function weekLabel(monday: ISODate, thisMonday: ISODate): string {
  const base = `Week of ${formatDate(monday)}`
  return monday === thisMonday ? `${base} (this week)` : base
}

const DEMO_WEEK_MESSAGE =
  'This week already has a demonstration record for this site, so it can’t be logged again. Pick another week.'

/**
 * One record per site per week — these records drive the data completeness score.
 * A week already logged on this device can be replaced; a week with a demo record is blocked.
 */
export default function WeeklyInputForm() {
  const { userLogs } = useLogs()
  const thisMonday = mondayOf(todayISO())
  const [siteId, setSiteId] = useState<SiteId | ''>(() => getLastSiteId() ?? '')
  const [week, setWeek] = useState<ISODate>(thisMonday)
  const [water, setWater] = useState('')
  const [compostType, setCompostType] = useState<CompostType | null>(null)
  const [compostKg, setCompostKg] = useState('')
  const [labour, setLabour] = useState('')
  const [notes, setNotes] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState<{
    id: string
    record: NewLog<'weeklyInputs'>
    /** Records this save replaced, kept for Undo. */
    replaced: WeeklyInputLog[]
  } | null>(null)
  const [undone, setUndone] = useState(false)

  // Demo records count even while hidden: the site-week is taken either way.
  const demoWeeks = useMemo(
    () => new Set(demoLogs.weeklyInputs.filter((w) => w.siteId === siteId).map((w) => w.weekStart)),
    [siteId],
  )
  const deviceRecordsForSite = useMemo(
    () => userLogs.weeklyInputs.filter((w) => w.siteId === siteId),
    [userLogs, siteId],
  )
  const deviceWeeks = new Set(deviceRecordsForSite.map((w) => w.weekStart))
  const weekOptions = recentMondays(WEEKS_TO_OFFER).map((m) => {
    const taken = demoWeeks.has(m) ? ' · logged (demo)' : deviceWeeks.has(m) ? ' · logged on this device' : ''
    return { value: m, label: `${weekLabel(m, thisMonday)}${taken}` }
  })
  const demoBlocked = siteId !== '' && demoWeeks.has(week)
  /** Normally one; older versions of the form allowed duplicates, and replacing clears them all. */
  const existing = demoBlocked ? [] : deviceRecordsForSite.filter((w) => w.weekStart === week)

  const waterL = parseDecimal(water)
  const compost = compostType === 'none' ? 0 : parseDecimal(compostKg)
  const labourH = parseDecimal(labour)

  const issues: FieldIssue[] = []
  if (!siteId) issues.push({ id: ID.site, short: 'site', message: 'Choose the site.' })
  if (demoBlocked) issues.push({ id: ID.week, short: 'another week', message: DEMO_WEEK_MESSAGE })
  const waterError = checkNumber(waterL, { what: 'water used', max: 50000, unit: 'L', allowZero: true })
  if (waterError) issues.push({ id: ID.water, short: 'water', message: waterError })
  if (!compostType) issues.push({ id: ID.compostType, short: 'compost type', message: 'Choose the compost type, or None this week.' })
  if (compostType && compostType !== 'none') {
    const compostError = checkNumber(compost, { what: 'compost amount', max: 1000, unit: 'kg' })
    if (compostError) issues.push({ id: ID.compostKg, short: 'compost amount', message: compostError })
  }
  const labourError = checkNumber(labourH, { what: 'labour hours', max: 200, unit: 'h', allowZero: true })
  if (labourError) issues.push({ id: ID.labour, short: 'labour', message: labourError })

  const err = (id: string) => issueMessage(issues, id, showErrors)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (issues.length > 0) {
      setShowErrors(true)
      focusFirstIssue(issues)
      return
    }
    if (!siteId || waterL === null || !compostType || compost === null || labourH === null) return

    const record: NewLog<'weeklyInputs'> = {
      siteId,
      weekStart: week,
      waterLitres: waterL,
      compostType,
      compostKg: compost,
      labourHours: labourH,
      notes: notes.trim() || undefined,
    }
    const result = existing.length
      ? replaceUserLogs(
          'weeklyInputs',
          existing.map((w) => w.id),
          record,
        )
      : addLog('weeklyInputs', record)
    if (!result.ok) {
      setSaveError(result.error)
      return
    }
    setLastSiteId(siteId)
    setSaveError(null)
    setUndone(false)
    setSaved({ id: result.id, record, replaced: existing })
  }

  /** Fill the form from this week's existing record, to correct it. */
  const editExisting = (r: WeeklyInputLog) => {
    setWater(String(r.waterLitres))
    setCompostType(r.compostType)
    setCompostKg(r.compostType === 'none' ? '' : String(r.compostKg))
    setLabour(String(r.labourHours))
    setNotes(r.notes ?? '')
  }

  const logAnother = () => {
    setWeek(thisMonday)
    setWater('')
    setCompostType(null)
    setCompostKg('')
    setLabour('')
    setNotes('')
    setShowErrors(false)
    setSaved(null)
  }

  if (saved) {
    const r = saved.record
    return (
      <SavedConfirmation
        title={saved.replaced.length ? "This week's record replaced" : 'Weekly inputs saved'}
        rows={[
          ['Site', siteName(r.siteId)],
          ['Week', weekLabel(r.weekStart, thisMonday)],
          ['Water', `${r.waterLitres} L`],
          ['Compost', compostSummary(r)],
          ['Labour', `${r.labourHours} h`],
        ]}
        anotherLabel="Log another week"
        onAnother={logAnother}
        onUndo={() => {
          if (saved.replaced.length) undoReplaceUserLogs('weeklyInputs', saved.id, saved.replaced)
          else removeUserLog('weeklyInputs', saved.id)
          setSaved(null)
          setUndone(true)
        }}
      />
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-3">
      <FormHeader
        title="Log weekly inputs"
        undoneMessage={
          undone ? 'Undone — the week is back as it was. Your entries are still here — change anything and save again.' : null
        }
      />
      <SiteSelect id={ID.site} value={siteId} onChange={setSiteId} error={err(ID.site)} />
      <SelectField
        id={ID.week}
        label="Week (Monday to Sunday)"
        value={week}
        onChange={setWeek}
        options={weekOptions}
        placeholder="Choose a week"
        // Shown straight away, not only after Save: the user needs to pick another week.
        error={demoBlocked ? DEMO_WEEK_MESSAGE : undefined}
      />
      {existing.length > 0 && <ExistingWeekRecord record={existing[existing.length - 1]} onEdit={editExisting} />}
      <NumberField
        id={ID.water}
        label="Water used"
        value={water}
        onChange={setWater}
        step={10}
        decimals={1}
        unit="L"
        hint="Total for the week. Enter 0 if it rained and nobody watered."
        error={err(ID.water)}
      />
      <ChoiceGroup
        id={ID.compostType}
        legend="Compost type"
        choices={compostOptions}
        value={compostType}
        onChange={setCompostType}
        columnsClass="grid-cols-2"
        error={err(ID.compostType)}
      />
      <NumberField
        id={ID.compostKg}
        label="Compost amount"
        value={compostType === 'none' ? '0' : compostKg}
        onChange={setCompostKg}
        step={0.5}
        decimals={1}
        unit="kg"
        disabled={compostType === 'none'}
        hint={compostType === 'none' ? 'No compost this week.' : undefined}
        error={err(ID.compostKg)}
      />
      <NumberField
        id={ID.labour}
        label="Labour hours"
        value={labour}
        onChange={setLabour}
        step={0.5}
        decimals={2}
        unit="h"
        hint="Watering, weeding and bed prep, all volunteers combined. Harvest time is logged with each harvest."
        error={err(ID.labour)}
      />
      <TextAreaField
        id={ID.notes}
        label="Notes"
        optional
        value={notes}
        onChange={setNotes}
        placeholder="e.g. heavy rain Tuesday, topped up wicking reservoirs"
      />
      <SaveBar label={existing.length ? "Replace this week's record" : 'Save weekly inputs'} missing={issues.map((i) => i.short)} error={saveError} />
    </form>
  )
}
