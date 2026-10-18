import { Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLogs } from '../../hooks/useLogs'
import { formatDate } from '../../lib/dates'
import { allEntries, ENTRY_KIND_LABELS, entryDate, entryDetail, entryTitle, type Entry } from '../../lib/entries'
import { deleteLog, resetAllDemoChanges, resetDemoRecord } from '../../lib/logStore'
import { notifyChange } from '../../lib/notify'
import type { LogKind } from '../../types'
import EditedTag from '../ui/EditedTag'
import EmptyState from '../ui/EmptyState'
import EditEntryDialog from './EditEntryDialog'

const PAGE = 8
type Filter = LogKind | 'all'
const FILTERS: Filter[] = ['all', 'harvests', 'plantings', 'weeklyInputs', 'failures']

/** Every log entry, newest first, each with Edit and Delete (Undo in the toast). Demo entries can be reset. */
export default function RecentEntries() {
  const { logs, demoChangeCount } = useLogs()
  const [filter, setFilter] = useState<Filter>('all')
  const [shown, setShown] = useState(PAGE)
  const [editing, setEditing] = useState<Entry | null>(null)

  const entries = useMemo(() => allEntries(logs).filter((e) => filter === 'all' || e.kind === filter), [logs, filter])

  function remove(e: Entry) {
    const undo = deleteLog(e.kind, e.record.id)
    notifyChange(`${ENTRY_KIND_LABELS[e.kind].one} deleted`, undo)
  }

  return (
    <div>
      {/* min-w-0: a fieldset otherwise grows to its content, defeating the scrollable chip row. */}
      <fieldset className="min-w-0">
        <legend className="sr-only">Show</legend>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {FILTERS.map((f) => (
            <label key={f} className="relative shrink-0 cursor-pointer">
              <input
                type="radio"
                name="recent-filter"
                className="peer sr-only"
                checked={filter === f}
                onChange={() => {
                  setFilter(f)
                  setShown(PAGE)
                }}
              />
              <span className="flex min-h-12 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-ink-muted transition-colors hover:text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-canvas peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
                {f === 'all' ? 'All' : ENTRY_KIND_LABELS[f].many}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {entries.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No entries yet" detail="Entries you log appear here, ready to edit or delete." />
        </div>
      ) : (
        <ul className="mt-4 border-t border-ink">
          {entries.slice(0, shown).map((e) => {
            const r = e.record
            const edited = Boolean(r.editedAt)
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line py-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
                    <span className="font-semibold text-ink">{ENTRY_KIND_LABELS[e.kind].one}</span>
                    <span>{formatDate(entryDate(e))}</span>
                    {r.source === 'demo' && <span className="text-demo">Demo</span>}
                    {edited && <EditedTag />}
                  </p>
                  <p className="font-semibold">{entryTitle(e)}</p>
                  <p className="text-sm text-ink-muted">{entryDetail(e)}</p>
                </div>
                <div className="flex shrink-0 items-center">
                  {r.source === 'demo' && edited && (
                    <button
                      type="button"
                      onClick={() => resetDemoRecord(r.id)}
                      aria-label={`Reset ${entryTitle(e)} to the original demo values`}
                      className="flex size-12 items-center justify-center rounded-full text-ink-muted hover:bg-sunken hover:text-ink"
                    >
                      <RotateCcw className="size-5" aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(e)}
                    aria-label={`Edit ${ENTRY_KIND_LABELS[e.kind].one.toLowerCase()}: ${entryTitle(e)}`}
                    className="flex size-12 items-center justify-center rounded-full text-ink-muted hover:bg-sunken hover:text-ink"
                  >
                    <Pencil className="size-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(e)}
                    aria-label={`Delete ${ENTRY_KIND_LABELS[e.kind].one.toLowerCase()}: ${entryTitle(e)}`}
                    className="flex size-12 items-center justify-center rounded-full text-ink-muted hover:bg-danger-bg hover:text-danger"
                  >
                    <Trash2 className="size-5" aria-hidden />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {entries.length > shown && (
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE * 2)}
            className="min-h-12 rounded-full border border-line-strong px-5 font-semibold transition-colors hover:bg-sunken"
          >
            Show more ({entries.length - shown} left)
          </button>
        )}
        {demoChangeCount > 0 && (
          <button
            type="button"
            onClick={resetAllDemoChanges}
            className="inline-flex min-h-12 items-center gap-2 rounded-full px-5 font-semibold underline underline-offset-4 hover:bg-sunken"
          >
            <RotateCcw className="size-4" aria-hidden />
            Reset all demo entries ({demoChangeCount} changed)
          </button>
        )}
      </div>

      {editing && <EditEntryDialog key={editing.record.id} entry={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
