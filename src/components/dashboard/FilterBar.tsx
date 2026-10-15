import { Download } from 'lucide-react'
import { sites } from '../../data'
import { inputClass } from '../../lib/forms'
import type { PeriodKey, SiteFilter } from '../../lib/metrics'
import { PERIOD_LABELS } from './periods'

interface Props {
  period: PeriodKey
  onPeriod: (p: PeriodKey) => void
  site: SiteFilter
  onSite: (s: SiteFilter) => void
  showDemo: boolean
  onShowDemo: (show: boolean) => void
  /** null when there is nothing to export */
  onExport: (() => void) | null
  exportCount: number
}

/** One row of filters above everything they scope. */
export default function FilterBar({ period, onPeriod, site, onSite, showDemo, onShowDemo, onExport, exportCount }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface p-3 shadow-card lg:flex-row lg:flex-wrap lg:items-end">
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Period</legend>
        <div className="grid grid-cols-3 rounded-xl border border-line p-1">
          {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map((key) => (
            <label key={key} className="cursor-pointer">
              <input
                type="radio"
                name="dashboard-period"
                className="peer sr-only"
                checked={period === key}
                onChange={() => onPeriod(key)}
              />
              <span className="flex min-h-12 items-center justify-center rounded-lg px-3 text-center text-sm font-medium text-ink-muted peer-checked:bg-brand-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-1">
                {/* "Last" is dropped on narrow screens so each option stays on one line. */}
                {PERIOD_LABELS[key].startsWith('Last ') ? (
                  <>
                    <span className="sr-only sm:not-sr-only">Last&nbsp;</span>
                    {PERIOD_LABELS[key].slice(5)}
                  </>
                ) : (
                  PERIOD_LABELS[key]
                )}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="lg:w-64">
        <label htmlFor="dashboard-site" className="mb-1 block text-sm font-medium">
          Site
        </label>
        <select
          id="dashboard-site"
          value={site}
          onChange={(e) => onSite(e.target.value as SiteFilter)}
          className={inputClass}
        >
          <option value="all">All sites</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* The whole row is the switch, so the touch target is the full 48px-high area. */}
      <button
        type="button"
        role="switch"
        aria-checked={showDemo}
        onClick={() => onShowDemo(!showDemo)}
        className="group flex min-h-12 items-center gap-3 rounded-xl px-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
      >
        <span
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
            showDemo ? 'bg-brand-700' : 'bg-line'
          }`}
          aria-hidden
        >
          <span
            className={`inline-block size-5 rounded-full bg-surface shadow transition-transform ${
              showDemo ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </span>
        <span className="text-sm">
          <span className="font-medium">Include demo data</span>
          <span className="block text-xs text-ink-muted">
            {showDemo ? 'Shown, labelled as demonstration' : 'Only logs from this device'}
          </span>
        </span>
      </button>

      <div className="lg:ml-auto">
        <button
          type="button"
          onClick={onExport ?? undefined}
          disabled={!onExport}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover:bg-transparent"
        >
          <Download className="size-4" aria-hidden />
          {onExport ? `Export harvests (${exportCount}) as CSV` : 'No harvests to export'}
        </button>
      </div>
    </div>
  )
}
