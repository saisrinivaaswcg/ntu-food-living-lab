import { Check } from 'lucide-react'
import { useId, useState } from 'react'
import { loadTicks, saveTicks, type ChecklistTicks } from '../../lib/handoverChecklist'
import type { HandoverRecord } from '../../types'

/** Interactive checklist; ticks are saved on this device for this handover record. */
export default function HandoverChecklist({ record }: { record: HandoverRecord }) {
  const id = useId()
  const [ticks, setTicks] = useState<ChecklistTicks>(() => loadTicks(record.id, record.checklist))
  const done = record.checklist.filter((item) => ticks[item.id]).length
  const total = record.checklist.length

  function toggle(itemId: string) {
    const next = { ...ticks, [itemId]: !ticks[itemId] }
    setTicks(next)
    saveTicks(record.id, next)
  }

  if (total === 0) return <p className="text-sm text-ink-muted">This handover has no checklist.</p>

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p id={`${id}-progress`} className="text-sm font-semibold tabular-nums" aria-live="polite">
          {done} of {total} done
        </p>
        <p className="text-sm text-ink-muted">Ticks are saved on this device.</p>
      </div>
      <div
        className="mt-2 h-1.5 bg-brand-100"
        role="progressbar"
        aria-labelledby={`${id}-progress`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div className="h-1.5 bg-brand-700 transition-[width] duration-500" style={{ width: `${(done / total) * 100}%` }} />
      </div>
      <ul className="mt-3 divide-y divide-line">
        {record.checklist.map((item) => {
          const checked = Boolean(ticks[item.id])
          return (
            <li key={item.id}>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 py-2">
                <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => toggle(item.id)} />
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-md border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-2 ${
                    checked ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-subtle bg-surface'
                  }`}
                  aria-hidden
                >
                  {checked && <Check className="size-4" strokeWidth={3} />}
                </span>
                <span className={checked ? 'text-ink-muted line-through' : ''}>{item.label}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
