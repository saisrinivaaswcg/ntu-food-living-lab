import { Printer } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import HandoverDetails from '../../components/sites/HandoverDetails'
import EmptyState from '../../components/ui/EmptyState'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import { CUP_SEMESTER, DEMO_DATA_NOTICE } from '../../data'
import { useCommunity, useHandovers } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useWorkspaceSite } from '../../hooks/useWorkspaceSite'
import { formatDate } from '../../lib/dates'
import { termSummary } from '../../lib/handover'
import { cropName } from '../../lib/lookups'
import { bedStatuses, growthAsOf } from '../../lib/metrics'
import { paths } from '../../lib/paths'
import NotFoundPage from '../NotFoundPage'

/** The printable handover pack: one record, its term summary, beds and checklist. */
export default function HandoverPackPage() {
  const { site } = useWorkspaceSite()
  const [params] = useSearchParams()
  const records = useHandovers(site?.id ?? '')
  const record = records.find((r) => r.id === params.get('id')) ?? records[0]
  const { logs } = useLogs()
  const { joins, tasks, claims } = useCommunity()
  const summary = useMemo(
    () => (site ? (record?.termSummary ?? termSummary(logs, site, CUP_SEMESTER, { joins, tasks, claims })) : []),
    [record, logs, site, joins, tasks, claims],
  )
  const beds = useMemo(() => {
    if (!site) return []
    if (record?.beds) return record.beds
    return bedStatuses(logs, site, growthAsOf(logs)).map((b) => ({ bedId: b.bed.id, label: b.bed.label, cropId: b.planting?.cropId ?? null, plants: b.plantsAlive, note: undefined }))
  }, [record, logs, site])
  usePageTitle(site ? `Handover pack · ${site.shortName}` : 'Site not found')
  if (!site) return <NotFoundPage title="Site not found" message="There is no site with that name. Pick one from the site switcher." />

  return (
    <div className="mx-auto max-w-4xl px-4 py-5 lg:px-8 lg:py-8 print:max-w-none print:p-0">
      <div className="print:hidden">
        <WorkspaceHeader
          crumbs={[{ label: site.shortName }, { label: 'Handover', to: paths.siteTool(site.id, 'handover') }, { label: 'Handover pack' }]}
          title="Handover pack"
          actions={
            record && (
              <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-brand-700 px-4 font-semibold text-white hover:bg-brand-800">
                <Printer className="size-4" aria-hidden />
                Print pack
              </button>
            )
          }
        />
      </div>

      {!record ? (
        <EmptyState title="No handover to print yet" detail="Run the handover wizard and the pack appears here." />
      ) : (
        <article className="rounded-card bg-surface p-6 shadow-card print:rounded-none print:p-0 print:shadow-none">
          <header className="border-b border-ink pb-4">
            <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">Handover pack · {record.term}</p>
            <h2 className="mt-1 font-display text-3xl font-medium">{site.name}</h2>
            <p className="text-ink-muted">
              Handed over {formatDate(record.date)} · {site.locationNote}
            </p>
            <p className="mt-2 text-xs text-demo">{DEMO_DATA_NOTICE}</p>
          </header>

          <section className="mt-6 break-inside-avoid">
            <h3 className="font-display text-xl font-medium">The term in numbers</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {summary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <HandoverDetails record={record} />
          </section>

          <section className="mt-6 break-inside-avoid">
            <h3 className="font-display text-xl font-medium">Beds</h3>
            <table className="mt-2 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="py-1.5 font-semibold">Bed</th>
                  <th scope="col" className="py-1.5 font-semibold">Growing</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">Plants</th>
                  <th scope="col" className="py-1.5 pl-3 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {beds.map((b) => (
                  <tr key={b.bedId} className="border-b border-line">
                    <td className="py-1.5">{b.label}</td>
                    <td className="py-1.5">{b.cropId ? cropName(b.cropId) : 'Empty'}</td>
                    <td className="py-1.5 text-right tabular-nums">{b.plants}</td>
                    <td className="py-1.5 pl-3 text-ink-muted">{b.note ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-6 break-inside-avoid">
            <h3 className="font-display text-xl font-medium">Checklist</h3>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {record.checklist.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-block size-4 shrink-0 border border-ink text-center text-xs leading-4" aria-hidden>
                    {c.done ? '✓' : ''}
                  </span>
                  <span>
                    {c.label}
                    <span className="sr-only">{c.done ? ' (done)' : ' (to do)'}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-6 border-t border-line pt-3 text-sm">
            <strong className="font-semibold">Committee PIN:</strong>{' '}
            {record.pinChanged ? 'changed at this handover and given to the incoming leads in person (never printed).' : 'not changed at this handover.'}
          </p>
        </article>
      )}
    </div>
  )
}
