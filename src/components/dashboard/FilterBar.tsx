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
  /** What the CSV holds, e.g. "harvests" */
  exportNoun: string
}

/** One row of filters above everything they scope. */
export default function FilterBar({
  period,
  onPeriod,
  site,
  onSite,
  showDemo,
  onShowDemo,
  onExport,
  exportCount,
  exportNoun,
}: Props) {
  return (
    <div className="flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:flex-wrap lg:items-end lg:gap-6">
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Period</legend>
        <div className="grid grid-cols-3 border border-line-strong">
          {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map((key) => (
            <label key={key} className="cursor-pointer">
              <input
                type="radio"
                name="dashboard-period"
                className="peer sr-only"
                checked={period === key}
                onChange={() => onPeriod(key)}
              />
              <span className="flex min-h-12 items-center justify-center px-4 text-center text-sm font-medium text-ink-muted transition-colors hover:bg-sunken hover:text-ink peer-checked:bg-ink peer-checked:text-canvas peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
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
        <label htmlFor="dashboard-site" className="mb-1.5 block text-sm font-medium">
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

      <div className="flex items-center justify-between gap-3 lg:contents">
        {/* Phones: switch and export share a row. The whole row is the switch, so its touch target is 48px high. */}
        <button
          type="button"
          role="switch"
          aria-checked={showDemo}
          onClick={() => onShowDemo(!showDemo)}
          className="group flex min-h-12 items-center gap-3 px-1 text-left"
        >
          <span
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
              showDemo ? 'bg-brand-700' : 'bg-line-strong'
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
            <span className="hidden text-sm text-ink-muted sm:block">
              {showDemo ? 'Shown and labelled' : 'This device only'}
            </span>
          </span>
        </button>

        <div className="shrink-0 lg:ml-auto">
          <button
            type="button"
            onClick={onExport ?? undefined}
            disabled={!onExport}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-accent px-5 font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-subtle"
          >
            <Download className="size-4" aria-hidden />
            {onExport ? (
              <>
                <span className="sm:hidden">Export CSV ({exportCount})</span>
                <span className="hidden sm:inline">
                  Export {exportNoun} ({exportCount}) as CSV
                </span>
              </>
            ) : (
              `No ${exportNoun} to export`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
