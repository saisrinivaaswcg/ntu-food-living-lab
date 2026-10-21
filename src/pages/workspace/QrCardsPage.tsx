import { Printer } from 'lucide-react'
import { useMemo } from 'react'
import EmptyState from '../../components/ui/EmptyState'
import QrCode from '../../components/ui/QrCode'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useWorkspaceSite } from '../../hooks/useWorkspaceSite'
import { cropName, findCrop } from '../../lib/lookups'
import { bedStatuses, growthAsOf } from '../../lib/metrics'
import { paths, publicUrl } from '../../lib/paths'
import NotFoundPage from '../NotFoundPage'

/**
 * A printable QR card for every bed. Each code opens the bed page: what's growing, care in three lines,
 * and pre-filled Log harvest / Log watering buttons. Print on A4, cut out, laminate.
 */
export default function QrCardsPage() {
  const { site } = useWorkspaceSite()
  const { logs } = useLogs()
  const asOf = growthAsOf(logs)
  const statuses = useMemo(() => (site ? bedStatuses(logs, site, asOf) : []), [logs, site, asOf])
  usePageTitle(site ? `QR cards · ${site.shortName}` : 'Site not found')
  if (!site) return <NotFoundPage title="Site not found" message="There is no site with that name. Pick one from the site switcher." />

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-8 print:max-w-none print:p-0">
      <div className="print:hidden">
        <WorkspaceHeader
          crumbs={[{ label: site.shortName }, { label: 'QR cards' }]}
          title="QR cards"
          lead={`One card per bed (${site.beds.length}). Scanning opens the bed page with its care card and quick-log buttons.`}
          actions={
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-brand-700 px-4 font-semibold text-white hover:bg-brand-800"
            >
              <Printer className="size-4" aria-hidden />
              Print cards
            </button>
          }
        />
        <p className="mb-6 text-sm text-ink-muted">
          Codes point to {publicUrl('')}. Set VITE_PUBLIC_SITE_URL when you deploy so printed cards open the live site.
          Cards follow the beds in Manage site; reprint after renaming a bed.
        </p>
      </div>

      {statuses.length === 0 ? (
        <EmptyState title="This site has no beds yet" detail="Add beds in Manage site, then print their cards." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 print:grid-cols-2 print:gap-0">
          {statuses.map((s) => {
            const url = publicUrl(paths.bed(site.id, s.bed.id))
            const crop = s.planting ? findCrop(s.planting.cropId) : undefined
            return (
              <li
                key={s.bed.id}
                className="flex break-inside-avoid gap-4 rounded-card border-2 border-dashed border-line-strong bg-white p-4 print:rounded-none print:border print:p-5"
              >
                <QrCode value={url} label={`QR code for ${s.bed.label}`} className="size-32 shrink-0 sm:size-36" />
                <div className="flex min-w-0 flex-col">
                  <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{site.shortName}</p>
                  <p className="font-display text-2xl leading-tight font-medium">{s.bed.label}</p>
                  <p className="mt-1 text-sm">{crop ? cropName(crop.id) : 'Resting bed'}</p>
                  {crop && <p className="mt-1 text-xs text-ink-muted">{crop.careGuide.quickCare[0]}</p>}
                  <p className="mt-auto pt-2 text-xs text-ink-muted">Scan to see care tips or log a harvest</p>
                  <p className="text-[10px] break-all text-ink-subtle">{url}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
