import { MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import CropChips from '../components/ui/CropChips'
import PhotoPlaceholder from '../components/ui/PhotoPlaceholder'
import StatusBadge from '../components/ui/StatusBadge'
import { useLogs } from '../hooks/useLogs'
import { usePageTitle } from '../hooks/usePageTitle'
import { cropName, findSite } from '../lib/lookups'
import { cropsCurrentlyGrowing, currentPlantingByBed } from '../lib/metrics'
import type { PlantingLog } from '../types'
import NotFoundPage from './NotFoundPage'

export default function SiteDetailPage() {
  const { siteId } = useParams()
  const site = findSite(siteId)
  const { logs } = useLogs()
  const current = useMemo(
    () => (site ? currentPlantingByBed(logs, site) : new Map<string, PlantingLog>()),
    [logs, site],
  )
  const growing = useMemo(() => (site ? cropsCurrentlyGrowing(logs, site) : []), [logs, site])
  usePageTitle(site?.name ?? 'Site not found')

  if (!site) {
    return (
      <NotFoundPage
        title="Site not found"
        message={`There is no site called "${siteId ?? ''}". Choose one of the four campus sites instead.`}
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-8">
      <Breadcrumbs items={[{ label: 'Sites', to: '/sites' }, { label: site.shortName }]} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-card bg-surface p-5 shadow-card lg:p-6">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">{site.name}</h1>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-muted">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            {site.locationNote}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StatusBadge status={site.status} />
            <span className="text-sm">{site.statusNote}</span>
          </div>
          <p className="mt-4 text-ink-muted">{site.description}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Beds', String(site.beds.length)],
              ['Growing area', `${site.areaSqm} m²`],
              ['Established', site.established.slice(0, 4)],
              ['Run by', site.managedBy],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-canvas p-3">
                <dt className="text-xs text-ink-muted">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-6 mb-2 text-sm font-semibold">Crops currently growing</h2>
          <CropChips cropIds={growing} emptyText="No crops currently growing — no live plantings logged for this site." />

          <h2 className="mt-6 mb-2 text-sm font-semibold">Beds</h2>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {site.beds.map((bed) => {
              const planting = current.get(bed.id)
              return (
                <li key={bed.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <span>{bed.label}</span>
                  <span className={planting ? 'text-brand-800' : 'text-ink-subtle'}>
                    {planting ? `${cropName(planting.cropId)} · planted ${planting.date}` : 'Nothing growing'}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <aside className="space-y-4">
          <PhotoPlaceholder alt={site.photoAlt} />
          <Link
            to={`/?site=${site.id}`}
            className="flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface px-4 font-semibold text-ink hover:bg-canvas"
          >
            Show on map
          </Link>
        </aside>
      </div>
    </div>
  )
}
