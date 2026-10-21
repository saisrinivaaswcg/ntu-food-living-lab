import { MapPin } from 'lucide-react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { imageAsset, siteImages } from '../../data'
import { getSites } from '../../lib/siteRegistry'
import type { CropId, Site } from '../../types'
import Breadcrumbs from '../layout/Breadcrumbs'
import CountUp from '../ui/CountUp'
import PhotoCaption from '../ui/PhotoCaption'
import SlotImage from '../ui/SlotImage'
import StatusBadge from '../ui/StatusBadge'
import { sitePhotoTransitionName } from './siteTransitions'

const EASE = [0.22, 1, 0.36, 1] as const
/** How far the photo drifts with the mouse, in px each way. */
const MOUSE_SHIFT = 14

interface Props {
  site: Site
  growing: CropId[]
}

/**
 * Full-width "living" photo of the site: one slow Ken Burns zoom (not looped, so the GPU rests after), parallax as the page scrolls, and on
 * desktop a slight drift with the mouse. Name, status and key numbers sit over a dark gradient.
 * All motion is off when the device asks for reduced motion.
 */
export default function SiteHero({ site, growing }: Props) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const driftX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const driftY = useSpring(mouseY, { stiffness: 60, damping: 20 })

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (reduce || e.pointerType !== 'mouse') return
    const box = e.currentTarget.getBoundingClientRect()
    mouseX.set(((e.clientX - box.left) / box.width - 0.5) * -2 * MOUSE_SHIFT)
    mouseY.set(((e.clientY - box.top) / box.height - 0.5) * -2 * MOUSE_SHIFT)
  }
  function onPointerLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  const index = getSites().findIndex((s) => s.id === site.id)
  const stats = [
    { value: site.beds.length, label: site.beds.length === 1 ? 'bed' : 'beds' },
    { value: site.areaSqm, label: 'm² growing area' },
    { value: growing.length, label: growing.length === 1 ? 'crop growing now' : 'crops growing now' },
    { value: Number(site.established.slice(0, 4)), label: 'established', plain: true },
  ]
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: EASE },
        }

  return (
    <section
      ref={ref}
      aria-labelledby="site-heading"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate flex min-h-[64svh] flex-col overflow-hidden bg-ink text-white lg:min-h-[min(80vh,46rem)]"
    >
      {/* Named for the view transition from the Sites list; the photo morphs from its card into this frame. */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden"
        style={{ viewTransitionName: sitePhotoTransitionName(site.id) }}
      >
        {/* Oversized so drifting and zooming never reveal an edge. */}
        <motion.div className="absolute -inset-[6%]" style={reduce ? undefined : { y: parallaxY }}>
          <motion.div className="absolute inset-0" style={reduce ? undefined : { x: driftX, y: driftY }}>
            <motion.div
              className="absolute inset-0"
              animate={reduce ? undefined : { scale: [1, 1.1] }}
              transition={{ duration: 18, ease: 'easeOut' }}
            >
              <SlotImage
                slot={siteImages[site.id]}
                tone={index}
                labelAt="top-right"
                placeholderClassName="px-[8%] py-[7%]"
                caption="none"
                priority
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      {imageAsset(siteImages[site.id].src) && (
        <PhotoCaption slot={siteImages[site.id]} className="absolute top-3 right-3 z-10 max-w-[60%]" />
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink/90 via-ink/50 to-ink/20" aria-hidden />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-3 pb-8 lg:px-8 lg:pb-12">
        <Breadcrumbs items={[{ label: 'Sites', to: '/sites' }, { label: site.shortName }]} onDark className="mb-auto" />

        <div className="mt-16 max-w-4xl">
          <motion.div {...enter(0.05)}>
            <StatusBadge status={site.status} onDark />
          </motion.div>
          <motion.h1
            id="site-heading"
            className="mt-3 font-display text-[clamp(2.5rem,1.5rem+4.6vw,5.25rem)] leading-[1] font-medium tracking-[-0.02em]"
            {...enter(0.12)}
          >
            {site.name}
          </motion.h1>
          <motion.p className="mt-4 max-w-2xl text-lg text-white/90" {...enter(0.22)}>
            {site.statusNote}
          </motion.p>
          <motion.p className="mt-3 flex items-start gap-1.5 text-white/85" {...enter(0.28)}>
            <MapPin className="mt-1 size-4 shrink-0" aria-hidden />
            {site.locationNote}
          </motion.p>
        </div>

        <motion.div
          className="mt-10 flex flex-col gap-6 border-t border-white/30 pt-6 lg:flex-row lg:items-end lg:justify-between"
          {...enter(0.36)}
        >
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:gap-x-12">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  {s.plain ? (
                    <span className="block font-display text-4xl font-medium tabular-nums">{s.value}</span>
                  ) : (
                    <CountUp
                      value={s.value}
                      format={(n) => String(Math.round(n))}
                      className="block font-display text-4xl font-medium tabular-nums"
                    />
                  )}
                  <span className="text-sm text-white/80" aria-hidden>
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <Link
            to={`/?site=${site.id}`}
            className="inline-flex min-h-12 w-fit items-center gap-2 rounded-sm border border-white/70 px-5 font-semibold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
          >
            <MapPin className="size-4" aria-hidden />
            Show on map
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
