import { Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useCrops } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { inputClass, parseDecimal } from '../../lib/forms'
import { resetSiteSetup, saveSiteSetup } from '../../lib/logStore'
import { bedStatuses, latestLogDate } from '../../lib/metrics'
import { notifyChange, notifyError } from '../../lib/notify'
import { todayISO } from '../../lib/dates'
import type { CropId, Site, SiteSetup } from '../../types'

interface Row {
  id: string
  label: string
  area: string
  cropId: CropId | ''
  plants: string
  /** What the bed held when editing started, to tell whether crop or plants were changed */
  initialCropId: CropId | ''
  initialPlants: string
  /** Kept from an earlier save, so an untouched bed keeps its hand-set planting */
  savedPlanting?: { cropId: CropId | null; plants: number }
}

const newBedId = (siteId: string) => `${siteId}-bed-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

/**
 * Beds & plants: site setup on this device. Add or remove beds, rename them, set each bed's area,
 * and the crop and plant count in it. Saved as overrides on top of the demo data; every metric
 * recalculates as soon as it's saved.
 */
export default function SiteSetupEditor({ site }: { site: Site }) {
  const crops = useCrops()
  const id = useId()
  const { logs, siteSetup } = useLogs()
  const setup = siteSetup[site.id]
  const statuses = useMemo(() => bedStatuses(logs, site, latestLogDate(logs) ?? todayISO()), [logs, site])

  const initialRows = (): Row[] =>
    site.beds.map((bed) => {
      const status = statuses.find((s) => s.bed.id === bed.id)
      const cropId = status?.planting?.cropId ?? ''
      const plants = status?.planting ? String(status.plantsAlive) : '0'
      return {
        id: bed.id,
        label: bed.label,
        area: String(bed.areaSqm ?? ''),
        cropId,
        plants,
        initialCropId: cropId,
        initialPlants: plants,
        savedPlanting: setup?.beds.find((b) => b.id === bed.id)?.planting,
      }
    })

  const [editing, setEditing] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [showErrors, setShowErrors] = useState(false)

  const update = (rowId: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === rowId ? { ...r, ...patch } : r)))

  const problems = (r: Row) => {
    const out: string[] = []
    if (!r.label.trim()) out.push('Give the bed a name.')
    const area = parseDecimal(r.area)
    if (area === null || area <= 0 || area > 1000) out.push('Area: a number above 0 m².')
    const plants = parseDecimal(r.plants)
    if (r.cropId && (plants === null || !Number.isInteger(plants) || plants < 0 || plants > 5000))
      out.push('Plants: a whole number, 0 or more.')
    return out
  }
  const anyProblems = rows.some((r) => problems(r).length > 0)

  function start() {
    setRows(initialRows())
    setShowErrors(false)
    setEditing(true)
  }

  function save() {
    if (anyProblems) {
      setShowErrors(true)
      return
    }
    const previous = setup
    const next: SiteSetup = {
      savedAt: new Date().toISOString(),
      beds: rows.map((r) => {
        const changed = r.cropId !== r.initialCropId || r.plants !== r.initialPlants
        const planting = changed
          ? { cropId: r.cropId || null, plants: r.cropId ? (parseDecimal(r.plants) ?? 0) : 0 }
          : r.savedPlanting
        return {
          id: r.id,
          label: r.label.trim(),
          areaSqm: parseDecimal(r.area) ?? 0,
          ...(planting ? { planting } : {}),
        }
      }),
    }
    const result = saveSiteSetup(site.id, next)
    if (!result.ok) {
      notifyError(result.error)
      return
    }
    setEditing(false)
    notifyChange('Beds & plants saved', () => (previous ? saveSiteSetup(site.id, previous) : resetSiteSetup(site.id)))
  }

  function reset() {
    const previous = setup
    resetSiteSetup(site.id)
    setEditing(false)
    if (previous) notifyChange('Beds & plants reset to the original values', () => saveSiteSetup(site.id, previous))
  }

  if (!editing) {
    return (
      <div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={start}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-5 font-semibold text-canvas transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Edit beds & plants
          </button>
          {setup && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong px-5 font-semibold transition-colors hover:bg-sunken"
            >
              <RotateCcw className="size-4" aria-hidden />
              Reset to original values
            </button>
          )}
        </div>
        {setup && (
          <p className="mt-3 text-sm text-ink-muted">
            Edited on this device (last saved{' '}
            {new Date(setup.savedAt).toLocaleString('en-SG', { dateStyle: 'medium', timeStyle: 'short' })}).
          </p>
        )}
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <p className="mb-4 text-sm text-ink-muted">
        Changes are saved on this device on top of the demo data. Plant counts set here count as what is in the bed now;
        harvests and losses logged later carry on from them.
      </p>
      <ul className="space-y-3">
        {rows.map((r, i) => {
          const rowProblems = showErrors ? problems(r) : []
          const errId = `${id}-${i}-err`
          return (
            <li
              key={r.id}
              className={`grid gap-3 rounded-2xl bg-surface p-4 shadow-card sm:grid-cols-[minmax(0,2fr)_6rem_minmax(0,1.5fr)_6rem_3rem] sm:items-end ${
                rowProblems.length ? 'ring-2 ring-danger' : ''
              }`}
            >
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Bed name</span>
                <input
                  className={inputClass}
                  value={r.label}
                  onChange={(e) => update(r.id, { label: e.target.value })}
                  aria-invalid={rowProblems.length ? true : undefined}
                  aria-describedby={rowProblems.length ? errId : undefined}
                  autoComplete="off"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Area (m²)</span>
                <input
                  className={`${inputClass} tabular-nums`}
                  inputMode="decimal"
                  value={r.area}
                  onChange={(e) => update(r.id, { area: e.target.value })}
                  autoComplete="off"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Crop growing</span>
                <select
                  className={inputClass}
                  value={r.cropId}
                  onChange={(e) =>
                    update(r.id, { cropId: e.target.value as CropId | '', plants: e.target.value ? r.plants : '0' })
                  }
                >
                  <option value="">Nothing growing</option>
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Plants</span>
                <input
                  className={`${inputClass} tabular-nums`}
                  inputMode="numeric"
                  value={r.plants}
                  disabled={!r.cropId}
                  onChange={(e) => update(r.id, { plants: e.target.value })}
                  autoComplete="off"
                />
              </label>
              <button
                type="button"
                onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
                aria-label={`Remove ${r.label || 'this bed'}`}
                className="flex size-12 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-danger-bg hover:text-danger"
              >
                <Trash2 className="size-5" aria-hidden />
              </button>
              {rowProblems.length > 0 && (
                <p id={errId} className="text-sm font-medium text-danger sm:col-span-5">
                  {rowProblems.join(' ')}
                </p>
              )}
            </li>
          )
        })}
      </ul>
      {rows.length === 0 && <p className="bg-sunken p-4 text-ink-muted">No beds. Add one below, or cancel.</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            setRows((rs) => [
              ...rs,
              {
                id: newBedId(site.id),
                label: `Bed ${rs.length + 1}`,
                area: '1',
                cropId: '',
                plants: '0',
                initialCropId: '',
                initialPlants: '0',
              },
            ])
          }
          className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong px-5 font-semibold transition-colors hover:bg-sunken"
        >
          <Plus className="size-4" aria-hidden />
          Add a bed
        </button>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="inline-flex min-h-12 items-center rounded-full px-5 font-semibold underline underline-offset-4 hover:bg-sunken"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-accent-strong active:translate-y-0"
        >
          Save changes
        </button>
      </div>
      {showErrors && anyProblems && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          Some beds need fixing before saving — see the highlighted rows.
        </p>
      )}
    </form>
  )
}
