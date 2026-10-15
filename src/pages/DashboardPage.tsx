import Breadcrumbs from '../components/layout/Breadcrumbs'
import { usePageTitle } from '../hooks/usePageTitle'

/** Replaced by the full dashboard in build step 4. */
export default function DashboardPage() {
  usePageTitle('Dashboard')
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-8">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-ink-muted">Harvest, water, labour and data completeness across the four sites.</p>
    </div>
  )
}
