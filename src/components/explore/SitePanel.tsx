import { ArrowRight, MapPin, X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { siteImages } from '../../data'
import { useLogs } from '../../hooks/useLogs'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { cropsCurrentlyGrowing } from '../../lib/metrics'
import type { Site } from '../../types'
import CropChips from '../ui/CropChips'
import SlotImage from '../ui/SlotImage'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  site: Site
  /** Position in the site list, so the placeholder tone matches the site's card. */
  index: number
  onClose: () => void
}

/** Desktop: slides in from the right, over the map. Phones: bottom sheet above the tab bar. */
export default function SitePanel({ site, index, onClose }: Props) {
  const { logs } = useLogs()
  const growing = useMemo(() => cropsCurrentlyGrowing(logs, site), [logs, site])
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingId = `site-panel-${site.id}`
  const desktop = useMediaQuery('(min-width: 1024px)')
  const reduce = useReducedMotion()
  const hidden = reduce ? { opacity: 0 } : desktop ? { opacity: 0, x: 48 } : { opacity: 0, y: '100%' }

  // Move focus into the panel whenever a site opens, so keyboard and screen-reader users land on it.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [site.id])

  return (
    <motion.aside
      aria-labelledby={headingId}
      initial={hidden}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={hidden}
      transition={{ duration: reduce ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 max-h-[55dvh] overflow-y-auto overscroll-contain rounded-t-md bg-surface shadow-float lg:absolute lg:inset-x-auto lg:top-4 lg:right-4 lg:bottom-8 lg:z-[600] lg:max-h-none lg:w-[26rem] lg:rounded-sm"
    >
      <div className="relative aspect-[21/9] lg:aspect-[16/9]">
        <SlotImage slot={siteImages[site.id]} tone={index} />
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${site.name} details`}
          className="absolute top-2 right-2 flex size-12 items-center justify-center rounded-sm bg-surface/95 text-ink shadow-float transition-colors hover:bg-surface"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="p-5">
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl leading-tight font-medium outline-none lg:text-3xl"
        >
          {site.name}
        </h2>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-muted">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {site.locationNote}
        </p>

        <div className="mt-4 border-t border-line pt-4">
          <StatusBadge status={site.status} />
          <p className="mt-1 text-ink">{site.statusNote}</p>
        </div>

        <dl className="mt-4 grid grid-cols-2 divide-x divide-line border-y border-line py-3">
          <div className="pr-4">
            <dt className="text-sm text-ink-muted">Beds</dt>
            <dd className="font-display text-3xl font-medium tabular-nums">{site.beds.length}</dd>
          </div>
          <div className="pl-4">
            <dt className="text-sm text-ink-muted">Growing area</dt>
            <dd className="font-display text-3xl font-medium tabular-nums">
              {site.areaSqm}
              <span className="ml-1 font-sans text-base text-ink-muted">m²</span>
            </dd>
          </div>
        </dl>

        <section className="mt-4" aria-labelledby={`${headingId}-crops`}>
          <h3 id={`${headingId}-crops`} className="mb-2 text-sm font-semibold">
            Crops currently growing
          </h3>
          <CropChips cropIds={growing} emptyText="No crops currently growing — no live plantings logged for this site." />
        </section>

      </div>

      {/* Kept in view at the bottom of the panel, however far its content scrolls. */}
      <div className="sticky bottom-0 border-t border-line bg-surface/95 p-4 backdrop-blur">
        <Link
          to={`/sites/${site.id}`}
          className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 font-semibold text-canvas transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-brand-800 active:translate-y-0"
        >
          View site
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </motion.aside>
  )
}
