import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import CommunityEditor from '../../components/community/CommunityEditor'
import BedList from '../../components/sites/BedList'
import SiteSetupEditor from '../../components/sites/SiteSetupEditor'
import ReadOnlyNotice from '../../components/workspace/ReadOnlyNotice'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import { useCommunity } from '../../hooks/useCommunity'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useWorkspaceSite } from '../../hooks/useWorkspaceSite'
import { communityFor } from '../../lib/community'
import { paths } from '../../lib/paths'
import NotFoundPage from '../NotFoundPage'

/** Site setup for a committee: beds, areas, and the crop and plant count in each bed. */
export default function ManageSitePage() {
  const { site, canEdit } = useWorkspaceSite()
  const { communities, editedCommunityIds } = useCommunity()
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

      <section id="community" aria-labelledby="community-heading" className="mt-6 scroll-mt-24 rounded-card bg-surface p-5 shadow-card lg:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="community-heading" className="font-display text-2xl font-medium">
            Community
          </h2>
          <Link to={paths.joinSite(site.id)} className="inline-flex min-h-12 items-center gap-1 font-semibold underline underline-offset-4">
            See the Join page
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
        <p className="mt-1 mb-5 text-sm text-ink-muted">What newcomers see on Join: workdays, where to meet, the roles you need and whether they may pick.</p>
        {canEdit ? (
          <CommunityEditor
            // A fresh form after a save, reset or site change.
            key={`${site.id}:${JSON.stringify(communityFor(communities, site.id))}`}
            community={communityFor(communities, site.id)}
            edited={editedCommunityIds.includes(site.id)}
          />
        ) : (
          <p className="text-ink-muted">Only the {site.shortName} committee can change these.</p>
        )}
      </section>
    </div>
  )
}
