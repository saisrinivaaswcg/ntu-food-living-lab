import { ArrowRight, MapPin, X } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLogs } from '../../hooks/useLogs'
import { cropsCurrentlyGrowing } from '../../lib/metrics'
import type { Site } from '../../types'
import CropChips from '../ui/CropChips'
import PhotoPlaceholder from '../ui/PhotoPlaceholder'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  site: Site
  onClose: () => void
}

/** Desktop: right-hand column beside the map. Mobile: bottom sheet above the tab bar. */
export default function SitePanel({ site, onClose }: Props) {
  const { logs } = useLogs()
  const growing = useMemo(() => cropsCurrentlyGrowing(logs, site), [logs, site])
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingId = `site-panel-${site.id}`

  // Move focus into the panel whenever a site opens, so keyboard and screen-reader users land on it.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [site.id])

  return (
    <aside
      aria-labelledby={headingId}
      className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 max-h-[55dvh] overflow-y-auto rounded-t-card border-t border-line bg-surface p-4 shadow-[0_-8px_24px_rgb(16_35_26/0.12)] lg:static lg:max-h-[560px] lg:rounded-card lg:border-0 lg:p-5 lg:shadow-card"
    >
      <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line lg:hidden" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <h2 id={headingId} ref={headingRef} tabIndex={-1} className="text-lg font-semibold leading-snug outline-none">
          {site.name}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${site.name} details`}
          className="-mr-2 -mt-2 flex size-12 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-muted">
        <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
        {site.locationNote}
      </p>

      <div className="mt-4">
        <PhotoPlaceholder alt={site.photoAlt} aspectClass="aspect-[5/2] lg:aspect-video" />
      </div>

      <div className="mt-4 space-y-2">
        <StatusBadge status={site.status} />
        <p className="text-sm text-ink">{site.statusNote}</p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-canvas p-3">
          <dt className="text-xs text-ink-muted">Beds</dt>
          <dd className="text-xl font-semibold">{site.beds.length}</dd>
        </div>
        <div className="rounded-xl bg-canvas p-3">
          <dt className="text-xs text-ink-muted">Growing area</dt>
          <dd className="text-xl font-semibold">
            {site.areaSqm} m<sup>2</sup>
          </dd>
        </div>
      </dl>

      <section className="mt-4" aria-labelledby={`${headingId}-crops`}>
        <h3 id={`${headingId}-crops`} className="mb-2 text-sm font-semibold">
          Crops currently growing
        </h3>
        <CropChips cropIds={growing} emptyText="No crops currently growing — no live plantings logged for this site." />
      </section>

      <Link
        to={`/sites/${site.id}`}
        className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 font-semibold text-white hover:bg-brand-800"
      >
        View site
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </aside>
  )
}
