import { ArrowRight, MapPin, X } from 'lucide-react'
import { motion, useDragControls, useReducedMotion, type PanInfo, type Variants } from 'motion/react'
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

/** Dragging the sheet down this far (px), or flicking it this fast (px/s), closes it. */
const CLOSE_DISTANCE = 96
const CLOSE_VELOCITY = 500

const SPRING = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 } as const

/** Panel contents rise in one after another, and leave in reverse. */
const list: Variants = {
  shown: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
  hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

/**
 * A floating, frosted panel. Desktop: inset from the map's right edge, springs in from the side.
 * Phones: a bottom sheet above the tab bar; drag the handle down (or use the close button) to close.
 */
export default function SitePanel({ site, index, onClose }: Props) {
  const { logs } = useLogs()
  const growing = useMemo(() => cropsCurrentlyGrowing(logs, site), [logs, site])
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingId = `site-panel-${site.id}`
  const desktop = useMediaQuery('(min-width: 1024px)')
  const reduce = useReducedMotion()
  const dragControls = useDragControls()

  const panel: Variants = reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1 } }
    : desktop
      ? { hidden: { opacity: 0, x: 40, scale: 0.96 }, shown: { opacity: 1, x: 0, y: 0, scale: 1, transition: SPRING } }
      : { hidden: { opacity: 0, y: '100%' }, shown: { opacity: 1, x: 0, y: 0, scale: 1, transition: SPRING } }

  // Move focus into the panel whenever a site opens, so keyboard and screen-reader users land on it.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [site.id])

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > CLOSE_DISTANCE || info.velocity.y > CLOSE_VELOCITY) onClose()
  }

  const sheetDrag = !desktop && !reduce

  return (
    <motion.aside
      aria-labelledby={headingId}
      data-lenis-prevent
      variants={panel}
      initial="hidden"
      animate="shown"
      exit="hidden"
      transition={{ duration: 0.2 }}
      drag={sheetDrag ? 'y' : false}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.6 }}
      onDragEnd={onDragEnd}
      className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 flex max-h-[55dvh] flex-col overflow-hidden rounded-t-3xl bg-surface/85 shadow-[0_-12px_48px_-12px_rgb(19_36_27/0.35)] backdrop-blur-xl backdrop-saturate-150 lg:absolute lg:inset-x-auto lg:top-6 lg:right-6 lg:bottom-10 lg:z-[600] lg:max-h-none lg:w-[26rem] lg:rounded-3xl lg:shadow-[0_32px_80px_-24px_rgb(19_36_27/0.45),0_12px_32px_-16px_rgb(19_36_27/0.25)]"
    >
      {/* Phones: the handle starts the swipe-down; the close button is the non-gesture way out. */}
      <div
        onPointerDown={(e) => sheetDrag && dragControls.start(e)}
        className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing lg:hidden"
        aria-hidden
      >
        <span className="h-1.5 w-10 rounded-full bg-ink/25" />
      </div>

      <motion.div variants={list} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-2 lg:pt-3">
        <motion.div
          variants={item}
          onPointerDown={(e) => sheetDrag && dragControls.start(e)}
          className="relative aspect-[21/9] touch-none overflow-hidden rounded-2xl lg:aspect-[16/10] lg:touch-auto"
        >
          <SlotImage slot={siteImages[site.id]} tone={index} />
          {/* Soft fade at the bottom so the photo melts into the panel. */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-surface/70 to-transparent" aria-hidden />
          <button
            type="button"
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`Close ${site.name} details`}
            className="absolute top-2 right-2 flex size-12 items-center justify-center rounded-full bg-surface/85 text-ink shadow-float backdrop-blur transition-[background-color,transform] hover:scale-105 hover:bg-surface active:scale-95"
          >
            <X className="size-5" aria-hidden />
          </button>
        </motion.div>

        <div className="px-2 pt-4">
          <motion.h2
            variants={item}
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-2xl leading-tight font-medium outline-none lg:text-3xl"
          >
            {site.name}
          </motion.h2>
          <motion.p variants={item} className="mt-2 flex items-start gap-1.5 text-sm text-ink-muted">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            {site.locationNote}
          </motion.p>

          <motion.div variants={item} className="mt-4">
            <StatusBadge status={site.status} />
            <p className="mt-1 text-ink">{site.statusNote}</p>
          </motion.div>

          <motion.dl variants={item} className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-ink/[0.04] px-4 py-3">
              <dt className="text-sm text-ink-muted">Beds</dt>
              <dd className="font-display text-3xl font-medium tabular-nums">{site.beds.length}</dd>
            </div>
            <div className="rounded-2xl bg-ink/[0.04] px-4 py-3">
              <dt className="text-sm text-ink-muted">Growing area</dt>
              <dd className="font-display text-3xl font-medium tabular-nums">
                {site.areaSqm}
                <span className="ml-1 font-sans text-base text-ink-muted">m²</span>
              </dd>
            </div>
          </motion.dl>

          <motion.section variants={item} className="mt-4" aria-labelledby={`${headingId}-crops`}>
            <h3 id={`${headingId}-crops`} className="mb-2 text-sm font-semibold">
              Crops currently growing
            </h3>
            <CropChips cropIds={growing} emptyText="No crops currently growing — no live plantings logged for this site." />
          </motion.section>
        </div>
      </motion.div>

      <motion.div variants={item} className="shrink-0 px-5 pt-2 pb-5">
        <Link
          to={`/sites/${site.id}`}
          className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 font-semibold text-canvas transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-brand-800 active:translate-y-0"
        >
          View site
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </motion.div>
    </motion.aside>
  )
}
