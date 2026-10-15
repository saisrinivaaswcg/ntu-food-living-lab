import Breadcrumbs from '../components/layout/Breadcrumbs'
import { usePageTitle } from '../hooks/usePageTitle'

/** Replaced by the form picker in build step 3. */
export default function LogPage() {
  usePageTitle('Log')
  return (
    <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8 lg:py-8">
      <Breadcrumbs items={[{ label: 'Log' }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Log</h1>
      <p className="mt-2 text-ink-muted">
        Record harvests, plantings, weekly inputs and failures in the same format at every site.
      </p>
    </div>
  )
}
