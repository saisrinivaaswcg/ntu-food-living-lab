import { Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { propagationOptions } from '../../data'
import { useCommunity } from '../../hooks/useCommunity'
import { addCrop, removeCrop } from '../../lib/communityStore'
import { focusFirstIssue, inputClass, issueMessage, parseDecimal, type FieldIssue } from '../../lib/forms'
import { notifyChange, notifyError } from '../../lib/notify'
import { paths } from '../../lib/paths'
import type { Crop, PlantForm, PropagationType } from '../../types'
import ChoiceGroup from '../log/ChoiceGroup'
import Field from '../log/Field'
import SelectField from '../log/SelectField'
import TextAreaField from '../log/TextAreaField'

const FORM_OPTIONS: { value: PlantForm; label: string }[] = [
  { value: 'upright-herb', label: 'Upright herb (like basil)' },
  { value: 'spreading-herb', label: 'Spreading herb (like mint)' },
  { value: 'grass-clump', label: 'Grassy clump (like lemongrass)' },
  { value: 'rosette', label: 'Rosette of long leaves (like pandan)' },
  { value: 'fruiting-shrub', label: 'Fruiting shrub (like chilli)' },
  { value: 'broadleaf-rhizome', label: 'Broad leaves from a root (like turmeric)' },
  { value: 'leafy-vine', label: 'Leafy vine (like kangkong)' },
]

const LIGHT_OPTIONS = ['Full sun', 'Morning sun', 'Part shade', 'Bright shade'].map((l) => ({ value: l, label: l }))

const lines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/**
 * Add a crop to the controlled vocabulary on this device, with the care guide Learn, bed pages and Grow
 * more need. Stages are spread over the days to first harvest the way the built-in crops are.
 */
export default function AddCropForm() {
  const { crops, customCropIds } = useCommunity()
  const [name, setName] = useState('')
  const [localName, setLocalName] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [days, setDays] = useState('60')
  const [form, setForm] = useState<PlantForm | ''>('')
  const [light, setLight] = useState('Full sun')
  const [startFrom, setStartFrom] = useState<PropagationType>('seed')
  const [perSqm, setPerSqm] = useState('9')
  const [summary, setSummary] = useState('')
  const [care, setCare] = useState(['', '', ''])
  const [readySign, setReadySign] = useState('')
  const [sow, setSow] = useState('')
  const [growing, setGrowing] = useState('')
  const [harvest, setHarvest] = useState('')
  const [climate, setClimate] = useState('')
  const [showErrors, setShowErrors] = useState(false)

  const d = parseDecimal(days)
  const per = parseDecimal(perSqm)
  const issues: FieldIssue[] = []
  if (!name.trim()) issues.push({ id: 'crop-name', short: 'name', message: 'Name the crop.' })
  if (!scientificName.trim()) issues.push({ id: 'crop-sci', short: 'botanical name', message: 'Add the botanical name so it’s never confused with another plant.' })
  if (d === null || d < 7 || d > 400 || !Number.isInteger(d)) issues.push({ id: 'crop-days', short: 'days', message: 'Whole days between 7 and 400.' })
  if (!form) issues.push({ id: 'crop-form', short: 'shape', message: 'Pick the closest plant shape (for the drawing on Learn).' })
  if (per === null || per <= 0 || per > 100) issues.push({ id: 'crop-per', short: 'spacing', message: 'Plants per m², between 0.1 and 100.' })
  if (care.some((c) => !c.trim())) issues.push({ id: 'crop-care-0', short: 'care lines', message: 'Write all three care lines; they print on bed pages.' })
  if (!lines(sow).length || !lines(growing).length || !lines(harvest).length) {
    issues.push({ id: 'crop-sow', short: 'steps', message: 'Add at least one step for sowing, growing and harvesting.' })
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (issues.length || d === null || per === null || !form) {
      setShowErrors(true)
      focusFirstIssue(issues)
      return
    }
    const id = slug(name) || `crop-${crops.length + 1}`
    const crop: Crop = {
      id,
      name: name.trim(),
      localName: localName.trim() || undefined,
      scientificName: scientificName.trim(),
      daysToFirstHarvest: d,
      form,
      careGuide: {
        summary: summary.trim() || `${name.trim()}, added by a site committee.`,
        light,
        startFrom,
        stageDays: { seedling: Math.max(1, Math.round(d * 0.15)), growing: Math.round(d * 0.4), ready: Math.round(d * 0.9), harvest: d },
        steps: {
          sow: lines(sow),
          seedling: ['Keep the strongest seedlings and give them a few mornings of sun before planting out.'],
          growing: lines(growing),
          ready: [readySign.trim() || 'Ready when it looks like the photo in the guide.'],
          harvest: lines(harvest),
        },
        readySign: readySign.trim() || 'Ready when it looks like the photo in the guide.',
        climate: lines(climate).length ? lines(climate) : ['No Singapore-specific notes yet: add what you learn to the problem log.'],
        quickCare: [care[0].trim(), care[1].trim(), care[2].trim()],
        plantsPerSqm: per,
      },
    }
    const result = addCrop(crop)
    if (!result.ok) {
      notifyError(result.error)
      return
    }
    notifyChange(`${crop.name} added`, () => removeCrop(crop.id), 'It’s in every form, on Learn and in Grow more now.')
    setName('')
    setLocalName('')
    setScientificName('')
    setSummary('')
    setCare(['', '', ''])
    setReadySign('')
    setSow('')
    setGrowing('')
    setHarvest('')
    setClimate('')
    setShowErrors(false)
  }

  const added = crops.filter((c) => customCropIds.includes(c.id))
  const err = (id: string) => issueMessage(issues, id, showErrors)

  return (
    <div>
      {added.length > 0 && (
        <ul className="mb-6 divide-y divide-line border-y border-line">
          {added.map((c) => (
            <li key={c.id} className="flex min-h-12 flex-wrap items-center justify-between gap-2 py-2">
              <Link to={paths.learnCrop(c.id)} className="font-semibold underline-offset-4 hover:underline">
                {c.name} <span className="font-normal text-ink-muted italic">{c.scientificName}</span>
              </Link>
              <button
                type="button"
                onClick={() => notifyChange(`${c.name} removed`, removeCrop(c.id))}
                className="inline-flex min-h-12 items-center gap-1.5 px-2 font-semibold text-ink-muted underline underline-offset-4"
              >
                <Trash2 className="size-4" aria-hidden />
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field id="crop-name" label="Crop name" error={err('crop-name')}>
          <input id="crop-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Sweet potato leaves" className={inputClass} />
        </Field>
        <Field id="crop-local" label="Local name" optional>
          <input id="crop-local" value={localName} onChange={(e) => setLocalName(e.target.value)} maxLength={40} placeholder="e.g. daun ubi" className={inputClass} />
        </Field>
        <Field id="crop-sci" label="Botanical name" error={err('crop-sci')}>
          <input id="crop-sci" value={scientificName} onChange={(e) => setScientificName(e.target.value)} maxLength={80} placeholder="e.g. Ipomoea batatas" className={inputClass} />
        </Field>
        <Field id="crop-days" label="Days from planting to first harvest" error={err('crop-days')}>
          <input id="crop-days" inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} className={inputClass} />
        </Field>
        <SelectField id="crop-form" label="Plant shape" value={form} onChange={setForm} options={FORM_OPTIONS} placeholder="Closest shape" error={err('crop-form')} />
        <SelectField id="crop-light" label="Light" value={light} onChange={setLight} options={LIGHT_OPTIONS} placeholder="Light" />
        <div className="sm:col-span-2">
          <ChoiceGroup
            id="crop-start"
            legend="Usually started from"
            choices={propagationOptions.map((p) => ({ value: p.value, label: p.label }))}
            value={startFrom}
            onChange={setStartFrom}
            columnsClass="grid-cols-3"
          />
        </div>
        <Field id="crop-per" label="Plants per m² at NTU spacing" error={err('crop-per')}>
          <input id="crop-per" inputMode="decimal" value={perSqm} onChange={(e) => setPerSqm(e.target.value)} className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <TextAreaField id="crop-summary" label="One line for the crop library" optional value={summary} onChange={setSummary} />
        </div>

        <fieldset className="space-y-2 sm:col-span-2">
          <legend className="mb-1 text-sm font-semibold">Care in three lines (printed on bed pages)</legend>
          {err('crop-care-0') && <p className="text-sm font-medium text-danger">{err('crop-care-0')}</p>}
          {care.map((c, i) => (
            <div key={i}>
              <label htmlFor={`crop-care-${i}`} className="sr-only">
                Care line {i + 1}
              </label>
              <input
                id={`crop-care-${i}`}
                value={c}
                onChange={(e) => setCare(care.map((x, j) => (j === i ? e.target.value : x)))}
                maxLength={90}
                placeholder={['Light and water', 'Feeding and pruning', 'How to harvest'][i]}
                className={inputClass}
              />
            </div>
          ))}
        </fieldset>

        <div className="sm:col-span-2">
          <TextAreaField id="crop-sow" label="Sowing steps (one per line)" value={sow} onChange={setSow} error={err('crop-sow')} />
        </div>
        <TextAreaField id="crop-growing" label="Growing steps (one per line)" value={growing} onChange={setGrowing} />
        <TextAreaField id="crop-harvest" label="Harvest steps (one per line)" value={harvest} onChange={setHarvest} />
        <TextAreaField id="crop-ready" label="What “ready” looks like" optional value={readySign} onChange={setReadySign} />
        <TextAreaField id="crop-climate" label="Notes for Singapore’s weather (one per line)" optional value={climate} onChange={setClimate} />

        <div className="sm:col-span-2">
          <button type="submit" className="inline-flex min-h-12 items-center rounded-sm bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800">
            Add crop
          </button>
          {showErrors && issues.length > 0 && <p className="mt-2 text-sm text-danger">Still needed: {issues.map((i) => i.short).join(', ')}</p>}
        </div>
      </form>
    </div>
  )
}
