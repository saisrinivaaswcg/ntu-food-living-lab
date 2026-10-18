import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useLogs } from '../../hooks/useLogs'
import { mondayOf } from '../../lib/dates'
import { ENTRY_KIND_LABELS, type Entry } from '../../lib/entries'
import { inputClass, parseDecimal } from '../../lib/forms'
import { updateLog } from '../../lib/logStore'
import { findSite } from '../../lib/lookups'
import { notifyChange, notifyError } from '../../lib/notify'
import { checkDate, checkNumber } from '../../lib/validation'
import type { SiteId } from '../../types'
import { EDIT_FIELDS, type EditField } from './editSchemas'

interface Props {
  entry: Entry
  onClose: () => void
}

type Values = Record<string, string>

const toText = (v: unknown) => (v === undefined || v === null ? '' : String(v))

/** Edit any log entry in a modal dialog. Saving changes it everywhere at once, with Undo in the toast. */
export default function EditEntryDialog({ entry, onClose }: Props) {
  const id = useId()
  const ref = useRef<HTMLDialogElement>(null)
  const { sites } = useLogs()
  const fields = EDIT_FIELDS[entry.kind]
  const record = entry.record as unknown as Record<string, unknown>
  const [values, setValues] = useState<Values>(() =>
    Object.fromEntries(fields.map((f) => [f.key, toText(record[f.key])])),
  )
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const set = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value, ...(key === 'siteId' ? { bedId: '' } : {}) }))

  const errors: Record<string, string> = {}
  for (const f of fields) {
    const raw = values[f.key] ?? ''
    if (f.type === 'date' || f.type === 'week') {
      const e = checkDate(raw)
      if (e) errors[f.key] = e
    } else if (f.type === 'number') {
      if (raw.trim() === '' && f.optional) continue
      const e = checkNumber(parseDecimal(raw), {
        what: f.label.toLowerCase(),
        max: f.max,
        unit: f.unit,
        whole: f.whole,
        allowZero: f.allowZero,
      })
      if (e) errors[f.key] = e
    } else if (f.type === 'text') {
      if (!f.optional && !raw.trim()) errors[f.key] = `Enter the ${f.label.toLowerCase()}.`
    } else if (!raw) {
      errors[f.key] = `Choose the ${f.label.toLowerCase()}.`
    }
  }
  if (entry.kind === 'failures') {
    const lost = parseDecimal(values.estimatedLossPlants ?? '')
    const inBed = parseDecimal(values.plantsInBed ?? '')
    const recovered = parseDecimal(values.recoveredPlants ?? '')
    if (lost !== null && inBed !== null && lost > inBed)
      errors.estimatedLossPlants = `Can't lose more than the ${inBed} plants in the bed.`
    if (lost !== null && recovered !== null && recovered > lost)
      errors.recoveredPlants = 'Recovered plants can’t be more than the plants lost.'
  }
  const hasErrors = Object.keys(errors).length > 0

  function save(e: FormEvent) {
    e.preventDefault()
    if (hasErrors) {
      setShowErrors(true)
      return
    }
    const patch: Record<string, unknown> = {}
    for (const f of fields) {
      const raw = values[f.key] ?? ''
      if (f.type === 'number') patch[f.key] = raw.trim() === '' ? undefined : (parseDecimal(raw) ?? undefined)
      else if (f.type === 'week') patch[f.key] = mondayOf(raw)
      else if (f.type === 'text') patch[f.key] = raw.trim() || (f.optional ? undefined : raw)
      else patch[f.key] = raw
    }
    const result = updateLog(entry.kind, entry.record.id, patch)
    if (!result.ok) {
      notifyError(result.error)
      return
    }
    notifyChange(`${ENTRY_KIND_LABELS[entry.kind].one} updated`, result.undo)
    ref.current?.close()
  }

  const site = findSite(values.siteId || undefined)

  function control(f: EditField) {
    const fieldId = `${id}-${f.key}`
    const error = showErrors ? errors[f.key] : undefined
    const common = {
      id: fieldId,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${fieldId}-error` : undefined,
    } as const
    switch (f.type) {
      case 'date':
      case 'week':
        return (
          <input
            {...common}
            type="date"
            className={inputClass}
            value={values[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
          />
        )
      case 'site':
        return (
          <select
            {...common}
            className={inputClass}
            value={values[f.key]}
            onChange={(e) => set(f.key, e.target.value as SiteId)}
          >
            <option value="">Choose a site</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )
      case 'bed':
        return (
          <select
            {...common}
            className={inputClass}
            value={values[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
            disabled={!site}
          >
            <option value="">{site ? 'Choose a bed' : 'Site first'}</option>
            {site?.beds.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        )
      case 'select':
        return (
          <select {...common} className={inputClass} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)}>
            <option value="">Choose</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )
      case 'number':
        return (
          <div className="relative">
            <input
              {...common}
              inputMode={f.whole ? 'numeric' : 'decimal'}
              autoComplete="off"
              className={`${inputClass} pr-16 tabular-nums`}
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
            />
            <span
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink-muted"
              aria-hidden
            >
              {f.unit}
            </span>
          </div>
        )
      case 'text':
        return (
          <textarea
            {...common}
            rows={3}
            className={`${inputClass} py-2`}
            value={values[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
          />
        )
      case 'choice':
        return null
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={`${id}-title`}
      className="m-auto max-h-[90dvh] w-[min(36rem,calc(100vw-2rem))] max-w-none overflow-y-auto rounded-3xl bg-surface p-0 text-ink shadow-float backdrop:bg-ink/60"
    >
      <form noValidate onSubmit={save}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3">
          <h2 id={`${id}-title`} className="font-display text-2xl font-medium">
            Edit {ENTRY_KIND_LABELS[entry.kind].one.toLowerCase()}
          </h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close without saving"
            className="flex size-12 items-center justify-center rounded-full hover:bg-sunken"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          {entry.record.source === 'demo' && (
            <p className="rounded-sm bg-demo-bg px-3 py-2 text-sm text-demo">
              Demonstration record. Changes are saved on this device and can be reset.
            </p>
          )}
          {fields.map((f) => {
            const fieldId = `${id}-${f.key}`
            const error = showErrors ? errors[f.key] : undefined
            if (f.type === 'choice') {
              return (
                <fieldset key={f.key} aria-describedby={error ? `${fieldId}-error` : undefined}>
                  <legend className="mb-1 text-sm font-semibold">{f.label}</legend>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {f.options.map((o) => (
                      <label key={o.value} className="block cursor-pointer">
                        <input
                          type="radio"
                          name={fieldId}
                          className="peer sr-only"
                          checked={values[f.key] === o.value}
                          onChange={() => set(f.key, o.value)}
                        />
                        <span className="flex min-h-12 items-center justify-center rounded-sm border border-line-strong px-2 text-sm font-medium peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
                          {o.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {error && (
                    <p id={`${fieldId}-error`} className="mt-1 text-sm font-medium text-danger">
                      {error}
                    </p>
                  )}
                </fieldset>
              )
            }
            return (
              <div key={f.key}>
                <label htmlFor={fieldId} className="mb-1 block text-sm font-semibold">
                  {f.label}
                  {'optional' in f && f.optional && <span className="font-normal text-ink-muted"> (optional)</span>}
                </label>
                {control(f)}
                {error && (
                  <p id={`${fieldId}-error`} className="mt-1 text-sm font-medium text-danger">
                    {error}
                  </p>
                )}
              </div>
            )
          })}
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-surface px-5 py-3">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="min-h-12 rounded-full px-5 font-semibold underline underline-offset-4 hover:bg-sunken"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-12 rounded-full bg-accent px-6 font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            Save changes
          </button>
        </div>
      </form>
    </dialog>
  )
}
