import Breadcrumbs from '../components/layout/Breadcrumbs'
import SiteCard from '../components/sites/SiteCard'
import { sites } from '../data'
import { usePageTitle } from '../hooks/usePageTitle'

export default function SitesPage() {
  usePageTitle('Sites')
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-8">
      <Breadcrumbs items={[{ label: 'Sites' }]} />
      <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Sites</h1>
      <p className="mt-1 max-w-2xl text-ink-muted">
        Each site keeps its growing knowledge and handover notes here, so they carry over from one committee to the
        next.
      </p>
      {sites.length === 0 ? (
        <p className="mt-6 rounded-card bg-surface p-6 text-sm text-ink-muted shadow-card">No sites to show.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {sites.map((site) => (
            <li key={site.id}>
              <SiteCard site={site} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
