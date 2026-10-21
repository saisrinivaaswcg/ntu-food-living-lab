import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import BedList from '../../components/sites/BedList'
import SiteSetupEditor from '../../components/sites/SiteSetupEditor'
import ReadOnlyNotice from '../../components/workspace/ReadOnlyNotice'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useWorkspaceSite } from '../../hooks/useWorkspaceSite'
import { paths } from '../../lib/paths'
import NotFoundPage from '../NotFoundPage'

/** Site setup for a committee: beds, areas, and the crop and plant count in each bed. */
export default function ManageSitePage() {
  const { site, canEdit } = useWorkspaceSite()
  usePageTitle(site ? `Manage ${site.shortName}` : 'Site not found')
  if (!site) return <NotFoundPage title="Site not found" message="There is no site with that name. Pick one from the site switcher." />

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-8">
      <WorkspaceHeader
        crumbs={[{ label: site.shortName }, { label: 'Manage site' }]}
        title="Manage site"
        lead={`${site.name} · ${site.beds.length} beds · ${site.areaSqm} m²`}
        actions={
          <Link
            to={paths.site(site.id)}
            className="inline-flex min-h-12 items-center gap-1 rounded-sm border border-line-strong px-4 font-semibold hover:bg-sunken"
          >
            Public page
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        }
      />
      {!canEdit && <ReadOnlyNotice site={site} tool="manage" />}

      <section aria-labelledby="beds-heading" className="rounded-card bg-surface p-5 shadow-card lg:p-6">
        <h2 id="beds-heading" className="font-display text-2xl font-medium">
          Beds & plants
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          What is in the ground now. Changes are site setup on this device, not plantings, and every dashboard follows
          them straight away.
        </p>
        <BedList site={site} />
        {canEdit && (
          <div className="mt-5">
            {/* key: a fresh editor when the site changes */}
            <SiteSetupEditor key={site.id} site={site} />
          </div>
        )}
      </section>
    </div>
  )
}
