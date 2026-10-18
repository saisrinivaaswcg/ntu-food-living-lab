import { Search } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { problemCauseOptions, problemStatusLabels } from '../../data'
import { inputClass } from '../../lib/forms'
import { cropName } from '../../lib/lookups'
import { sortCropIds } from '../../lib/metrics'
import type { CropId, ProblemEntry } from '../../types'
import EmptyState from '../ui/EmptyState'
import ProblemCard from './ProblemCard'

type StatusFilter = ProblemEntry['status'] | 'all'
type CropFilter = CropId | 'all' | 'none'
type CauseFilter = ProblemEntry['cause'] | 'all'

const STATUS_FILTERS: StatusFilter[] = ['all', 'open', 'resolved']

function matchesQuery(p: ProblemEntry, query: string): boolean {
  if (!query) return true
  const haystack = [p.title, p.symptoms, p.actionTaken, ...p.tags].join(' ').toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word))
}

/** Searchable, filterable list of one site's problems, newest first. */
export default function ProblemLog({ problems }: { problems: ProblemEntry[] }) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [crop, setCrop] = useState<CropFilter>('all')
  const [cause, setCause] = useState<CauseFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')

  const cropIds = useMemo(() => sortCropIds(problems.flatMap((p) => (p.cropId ? [p.cropId] : []))), [problems])
  const hasSiteWide = problems.some((p) => !p.cropId)

  const shown = useMemo(
    () =>
      problems
        .filter(
          (p) =>
            matchesQuery(p, query.trim()) &&
            (crop === 'all' || (crop === 'none' ? !p.cropId : p.cropId === crop)) &&
            (cause === 'all' || p.cause === cause) &&
            (status === 'all' || p.status === status),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [problems, query, crop, cause, status],
  )

  const filtered = query.trim() !== '' || crop !== 'all' || cause !== 'all' || status !== 'all'
  function clearFilters() {
    setQuery('')
    setCrop('all')
    setCause('all')
    setStatus('all')
  }

  if (problems.length === 0) {
    return <EmptyState title="No problems logged for this site" detail="Problems the committee records will appear here." />
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-q`} className="mb-1 block text-sm font-medium">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input
              id={`${id}-q`}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. caterpillar, netting…"
              autoComplete="off"
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>
        <div>
          <label htmlFor={`${id}-crop`} className="mb-1 block text-sm font-medium">
            Crop
          </label>
          <select
            id={`${id}-crop`}
            value={crop}
            onChange={(e) => setCrop(e.target.value as CropFilter)}
            className={inputClass}
          >
            <option value="all">All crops</option>
            {cropIds.map((c) => (
              <option key={c} value={c}>
                {cropName(c)}
              </option>
            ))}
            {hasSiteWide && <option value="none">Whole site</option>}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-cause`} className="mb-1 block text-sm font-medium">
            Cause
          </label>
          <select
            id={`${id}-cause`}
            value={cause}
            onChange={(e) => setCause(e.target.value as CauseFilter)}
            className={inputClass}
          >
            <option value="all">All causes</option>
            {problemCauseOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="mt-3">
        <legend className="mb-1 text-sm font-medium">Status</legend>
        <div className="inline-grid grid-cols-3 border border-line-strong">
          {STATUS_FILTERS.map((s) => (
            <label key={s} className="cursor-pointer">
              <input
                type="radio"
                name={`${id}-status`}
                className="peer sr-only"
                checked={status === s}
                onChange={() => setStatus(s)}
              />
              <span className="flex min-h-12 items-center justify-center px-4 text-sm font-medium text-ink-muted transition-colors hover:bg-sunken hover:text-ink peer-checked:bg-ink peer-checked:text-canvas peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
                {s === 'all' ? 'All' : problemStatusLabels[s]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 flex min-h-12 flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {shown.length === problems.length
            ? `${problems.length} problems`
            : `${shown.length} of ${problems.length} problems`}
        </p>
        {filtered && (
          <button
            type="button"
            onClick={clearFilters}
            className="min-h-12 rounded-sm px-3 text-sm font-semibold text-ink underline underline-offset-4 hover:bg-canvas"
          >
            Clear filters
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <EmptyState title="No problems match" detail="Try another search word or clear the filters." />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {shown.map((p) => (
            <li key={p.id}>
              <ProblemCard problem={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
