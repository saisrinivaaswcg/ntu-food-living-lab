import { Sprout } from 'lucide-react'
import { DEMO_DATA_NOTICE, sites } from './data'
import { useLogs } from './hooks/useLogs'

/**
 * Temporary placeholder (Step 1). Confirms Tailwind, Lucide and the data layer work.
 * Replaced by the router and real pages in Step 2.
 */
export default function App() {
  const { logs } = useLogs()

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="rounded-card bg-surface p-6 shadow-card">
        <div className="flex items-center gap-3 text-brand-700">
          <Sprout className="size-7" aria-hidden />
          <h1 className="text-xl font-semibold text-ink">NTU Food Living Lab — project set up</h1>
        </div>
        <p className="mt-2 text-sm text-ink-muted">Data layer loaded. Pages are built in the next steps.</p>
        <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <li className="rounded-xl bg-brand-50 p-3">{sites.length} sites</li>
          <li className="rounded-xl bg-brand-50 p-3">{logs.plantings.length} plantings</li>
          <li className="rounded-xl bg-brand-50 p-3">{logs.harvests.length} harvests</li>
          <li className="rounded-xl bg-brand-50 p-3">{logs.weeklyInputs.length} weekly input logs</li>
          <li className="rounded-xl bg-brand-50 p-3">{logs.failures.length} failures</li>
        </ul>
        <p className="mt-4 rounded-xl bg-demo-bg p-3 text-xs text-demo">{DEMO_DATA_NOTICE}</p>
      </div>
    </main>
  )
}
