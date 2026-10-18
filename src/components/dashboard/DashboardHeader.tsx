import { useLocation } from 'react-router-dom'
import { setShowDemoData } from '../../lib/logStore'
import type { DashboardScope } from '../../hooks/useDashboard'
import Breadcrumbs from '../layout/Breadcrumbs'
import DashboardNav from './DashboardNav'
import FilterBar from './FilterBar'

interface Props {
  dash: DashboardScope
  /** Breadcrumb label for this dashboard; omit on the overview */
  crumb?: string
  /** The headline sentence (no full stop) */
  headline: string
  onExport: (() => void) | null
  exportCount: number
  exportNoun: string
}

/** Breadcrumbs, dashboard tabs, headline sentence and the shared filters. */
export default function DashboardHeader({ dash, crumb, headline, onExport, exportCount, exportNoun }: Props) {
  const { search } = useLocation()
  const demoNote = dash.showDemoData ? <span className="text-demo"> Includes demonstration data.</span> : null
  return (
    <>
      <Breadcrumbs
        items={crumb ? [{ label: 'Dashboard', to: `/dashboard${search}` }, { label: crumb }] : [{ label: 'Dashboard' }]}
        className="mb-2"
      />
      <DashboardNav />

      <header className="mt-8 max-w-4xl">
        <h1 className="font-display text-display font-medium">{`${headline}.`}</h1>
        <p className="mt-3 max-w-2xl text-ink-muted lg:text-lg">
          {dash.hasAnyLogs ? (
            <>
              {dash.periodLabel}, {dash.scope}: {dash.rangeText}. Periods end on the latest log, not today.{demoNote}
            </>
          ) : (
            'Open to anyone. Every number comes from the logs at the four sites.'
          )}
        </p>
      </header>

      <div className="mt-8">
        <FilterBar
          period={dash.periodKey}
          onPeriod={(v) => dash.setFilter('period', v)}
          site={dash.site}
          onSite={(v) => dash.setFilter('site', v)}
          showDemo={dash.showDemoData}
          onShowDemo={setShowDemoData}
          onExport={onExport}
          exportCount={exportCount}
          exportNoun={exportNoun}
        />
      </div>
    </>
  )
}
