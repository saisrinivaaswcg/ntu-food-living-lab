import { ArrowUpRight, Mail, MessageCircle, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReadOnlyNotice from '../../components/workspace/ReadOnlyNotice'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import EmptyState from '../../components/ui/EmptyState'
import { DEMO_DATA_SHORT_NOTICE } from '../../data'
import { useCommunity } from '../../hooks/useCommunity'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useWorkspaceSite } from '../../hooks/useWorkspaceSite'
import { communityFor, joinsForSite, roleTitle } from '../../lib/community'
import { setJoinStatus } from '../../lib/communityStore'
import { formatDate, toISODate } from '../../lib/dates'
import { notifyChange } from '../../lib/notify'
import { paths } from '../../lib/paths'
import type { JoinRequest, JoinStatus } from '../../types'
import NotFoundPage from '../NotFoundPage'

const STATUSES: { value: JoinStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'welcomed', label: 'Welcomed' },
]

const METHOD_ICON = { email: Mail, telegram: MessageCircle, phone: Phone } as const

/** Interest inbox: people who asked to join this site's community, and where each one is up to. */
export default function InboxPage() {
  const { site, canEdit } = useWorkspaceSite()
  const { joins, communities } = useCommunity()
  const [filter, setFilter] = useState<JoinStatus | 'all'>('all')
  usePageTitle(site ? `Interest inbox · ${site.shortName}` : 'Site not found')
  if (!site) return <NotFoundPage title="Site not found" message="There is no site with that name. Pick one from the site switcher." />

  const community = communityFor(communities, site.id)
  const all = joinsForSite(joins, site.id)
  const shown = filter === 'all' ? all : all.filter((j) => j.status === filter)
  const count = (s: JoinStatus) => all.filter((j) => j.status === s).length

  function move(j: JoinRequest, status: JoinStatus) {
    const before = j.status
    setJoinStatus(j.id, status)
    notifyChange(`${j.name}: ${STATUSES.find((s) => s.value === status)?.label}`, () => setJoinStatus(j.id, before))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-8">
      <WorkspaceHeader
        crumbs={[{ label: site.shortName }, { label: 'Interest inbox' }]}
        title="Interest inbox"
        lead={`People who asked to join ${site.shortName}. ${count('new')} new · ${count('contacted')} contacted · ${count('welcomed')} welcomed.`}
        actions={
          <Link to={paths.joinSite(site.id)} className="inline-flex min-h-12 items-center gap-1 rounded-sm border border-line-strong px-4 font-semibold hover:bg-sunken">
            Public join page
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        }
      />
      {!canEdit && <ReadOnlyNotice site={site} tool="inbox" />}
      <p className="mb-4 text-sm text-demo">{DEMO_DATA_SHORT_NOTICE} Contact details show only when the person agreed to be contacted.</p>

      <div role="group" aria-label="Show" className="mb-4 flex flex-wrap gap-1.5">
        {[{ value: 'all' as const, label: `All (${all.length})` }, ...STATUSES.map((s) => ({ value: s.value, label: `${s.label} (${count(s.value)})` }))].map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className="inline-flex min-h-12 items-center rounded-sm border border-line-strong px-3 text-sm font-semibold aria-pressed:border-brand-700 aria-pressed:bg-brand-700 aria-pressed:text-white"
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          title={all.length === 0 ? 'No one has asked to join yet' : 'No requests with this status'}
          detail={all.length === 0 ? 'Share the public join page; requests arrive here.' : 'Choose another filter above.'}
        />
      ) : (
        <ul className="space-y-3">
          {shown.map((j) => {
            const Icon = METHOD_ICON[j.contactMethod]
            return (
              <li key={j.id} className="rounded-card bg-surface p-4 shadow-card lg:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold">
                    {j.name} <span className="font-normal text-ink-muted">· {j.hall}</span>
                  </h2>
                  <p className="text-sm text-ink-muted">
                    Asked {formatDate(toISODate(new Date(j.createdAt)))}
                    {j.source === 'demo' ? <span className="text-demo"> · demo</span> : <span> · on this device</span>}
                  </p>
                </div>
                <p className="mt-1">
                  Would like: <strong className="font-semibold">{roleTitle(community, j.roleId)}</strong>
                </p>
                {j.note && <p className="mt-1 text-ink-muted">“{j.note}”</p>}
                <p className="mt-2 flex items-center gap-1.5 text-sm">
                  <Icon className="size-4 text-brand-700" aria-hidden />
                  {!j.consent ? 'Did not agree to be contacted' : canEdit ? j.contact : 'Contact visible to this site’s committee only'}
                </p>
                {canEdit && (
                  <div role="group" aria-label={`Status for ${j.name}`} className="mt-3 grid grid-cols-3 gap-1.5 sm:inline-grid">
                    {STATUSES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        aria-pressed={j.status === s.value}
                        onClick={() => j.status !== s.value && move(j, s.value)}
                        className="min-h-12 rounded-sm border border-line-strong px-3 text-sm font-semibold aria-pressed:border-brand-700 aria-pressed:bg-brand-700 aria-pressed:text-white"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
                {!canEdit && <p className="mt-2 text-sm font-semibold">Status: {STATUSES.find((s) => s.value === j.status)?.label}</p>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
