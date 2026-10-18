import { History, PencilLine } from 'lucide-react'
import { compostSummary } from '../../lib/format'
import type { WeeklyInputLog } from '../../types'

interface Props {
  record: WeeklyInputLog
  onEdit: (record: WeeklyInputLog) => void
}

/** The record already saved on this device for the chosen site-week. Saving replaces it. */
export default function ExistingWeekRecord({ record, onEdit }: Props) {
  return (
    <section aria-labelledby="existing-week-heading" className="rounded-sm bg-sunken p-3">
      <h2 id="existing-week-heading" className="flex items-center gap-2 text-sm font-semibold text-brand-800">
        <History className="size-4" aria-hidden />
        Already logged on this device
      </h2>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs text-ink-muted">Water</dt>
          <dd className="font-medium">{record.waterLitres} L</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Compost</dt>
          <dd className="font-medium">{compostSummary(record)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Labour</dt>
          <dd className="font-medium">{record.labourHours} h</dd>
        </div>
      </dl>
      {record.notes && <p className="mt-2 text-sm text-ink-muted">“{record.notes}”</p>}
      <p className="mt-2 text-xs text-ink-muted">Only one record per site per week. Saving replaces this one.</p>
      <button
        type="button"
        onClick={() => onEdit(record)}
        className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-sm border border-line-strong bg-surface px-3 text-sm font-semibold text-brand-800 hover:bg-brand-100"
      >
        <PencilLine className="size-4" aria-hidden />
        Copy these values into the form
      </button>
    </section>
  )
}
