import { Check, ExternalLink, MapPin, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import RoleGate from '../../components/access/RoleGate'
import EmptyState from '../../components/ui/EmptyState'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import { contactMethodOptions } from '../../data'
import { useCommunity } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { decideSiteRequest } from '../../lib/communityStore'
import { formatDate, toISODate } from '../../lib/dates'
import { inputClass } from '../../lib/forms'
import { notifyChange } from '../../lib/notify'
import { paths } from '../../lib/paths'
import { ROLE_LABELS } from '../../lib/roles'
import type { SiteRequest } from '../../types'

/** Admin: approve or decline requests for new hall sites. Approved sites appear on the map and in the Hall Cup. */
export default function ApprovalsPage() {
  usePageTitle('Approve new sites')
  const { siteRequests } = useCommunity()
  const pending = siteRequests.filter((r) => r.status === 'pending')
  const decided = siteRequests.filter((r) => r.status !== 'pending')

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-8">
      <RoleGate allow={['admin']} what="Approving new sites" why="The Sustainability Office checks each new hall garden before it goes on the map.">
        <WorkspaceHeader
          crumbs={[{ label: 'Approve new sites' }]}
          title="Approve new sites"
          lead={`${pending.length} waiting · ${decided.length} decided. Requests made on this device (demo).`}
          actions={
            <Link to={paths.startGardenRequest} className="inline-flex min-h-12 items-center rounded-sm border border-line-strong px-4 font-semibold hover:bg-sunken">
              Request form
            </Link>
          }
        />

        <section aria-labelledby="pending-heading">
          <h2 id="pending-heading" className="font-display text-2xl font-medium">
            Waiting for a decision
          </h2>
          {pending.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Nothing to approve" detail="When a student or committee requests a hall site, it waits here." />
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {pending.map((r) => (
                <RequestCard key={r.id} request={r} />
              ))}
            </ul>
          )}
        </section>

        {decided.length > 0 && (
          <section aria-labelledby="decided-heading" className="mt-10">
            <h2 id="decided-heading" className="font-display text-2xl font-medium">
              Decided
            </h2>
            <ul className="mt-3 divide-y divide-line">
              {decided.map((r) => (
                <li key={r.id} className="flex min-h-12 flex-wrap items-center justify-between gap-2 py-2">
                  <span>
                    <span className="font-semibold">{r.name}</span> <span className="text-ink-muted">· {r.hall}</span>
                  </span>
                  <span className="flex items-center gap-3 text-sm">
                    {r.status === 'approved' ? <span className="font-semibold text-brand-700">Approved</span> : <span className="font-semibold text-danger">Declined</span>}
                    {r.status === 'approved' && r.siteId && (
                      <Link to={paths.site(r.siteId)} className="inline-flex min-h-12 items-center font-semibold underline underline-offset-4">
                        Site page
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </RoleGate>
    </div>
  )
}

function RequestCard({ request: r }: { request: SiteRequest }) {
  const { sites } = useLogs()
  const [declining, setDeclining] = useState(false)
  const [note, setNote] = useState('')
  const area = r.beds.reduce((n, b) => n + b.areaSqm, 0)

  function decide(status: 'approved' | 'declined') {
    const undo = decideSiteRequest(r.id, status, sites.map((s) => s.id), status === 'declined' ? note.trim() || undefined : undefined)
    notifyChange(status === 'approved' ? `${r.name} approved` : `${r.name} declined`, undo, status === 'approved' ? 'It’s on the map and in the Hall Cup now.' : undefined)
  }

  return (
    <li className="overflow-hidden rounded-card bg-surface shadow-card sm:grid sm:grid-cols-[14rem_1fr]">
      {r.photo ? (
        <img src={r.photo.dataUrl} alt={`Photo of the proposed spot for ${r.name}`} className="h-48 w-full object-cover sm:h-full" />
      ) : (
        <div className="flex h-24 items-center justify-center bg-sunken text-sm text-ink-muted sm:h-full">No photo</div>
      )}
      <div className="p-4 lg:p-5">
        <h3 className="font-display text-2xl font-medium">{r.name}</h3>
        <p className="text-ink-muted">
          {r.hall} · {r.beds.length} {r.beds.length === 1 ? 'bed' : 'beds'} · {area.toFixed(1)} m²
        </p>
        <p className="mt-2">{r.description}</p>
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
          <MapPin className="size-4 text-brand-700" aria-hidden />
          {r.locationNote} ({r.coordinates[0].toFixed(5)}, {r.coordinates[1].toFixed(5)})
          <a
            href={`https://www.onemap.gov.sg/?lat=${r.coordinates[0]}&lng=${r.coordinates[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-1 font-semibold underline underline-offset-4"
          >
            Open in OneMap
            <ExternalLink className="size-3.5" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </p>
        <p className="text-sm text-ink-muted">Beds: {r.beds.map((b) => `${b.label} (${b.areaSqm} m²)`).join(', ')}</p>
        <p className="mt-1 text-sm">
          From {r.requesterName} ({ROLE_LABELS[r.requesterRole]}) · {contactMethodOptions.find((o) => o.value === r.contactMethod)?.label}: {r.contact} · sent{' '}
          {formatDate(toISODate(new Date(r.createdAt)))}
        </p>

        {declining ? (
          <div className="mt-4 space-y-2">
            <label htmlFor={`note-${r.id}`} className="block text-sm font-semibold">
              Why not (sent to the requester)
            </label>
            <textarea id={`note-${r.id}`} value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={300} className={`${inputClass} py-3`} />
            <div className="flex gap-2">
              <button type="button" onClick={() => decide('declined')} className="inline-flex min-h-12 items-center rounded-sm bg-danger px-4 font-semibold text-white">
                Decline request
              </button>
              <button type="button" onClick={() => setDeclining(false)} className="inline-flex min-h-12 items-center px-3 font-semibold underline underline-offset-4">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => decide('approved')} className="inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-brand-700 px-4 font-semibold text-white hover:bg-brand-800">
              <Check className="size-4" aria-hidden />
              Approve
            </button>
            <button type="button" onClick={() => setDeclining(true)} className="inline-flex min-h-12 items-center gap-1.5 rounded-sm border border-line-strong px-4 font-semibold hover:bg-sunken">
              <X className="size-4" aria-hidden />
              Decline
            </button>
          </div>
        )}
      </div>
    </li>
  )
}
