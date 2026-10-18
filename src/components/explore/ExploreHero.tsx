import { ArrowDown, ClipboardPen } from 'lucide-react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { crops, exploreHeroImage, exploreHeroVideo, imageAsset, sites, videoAsset } from '../../data'
import { formatNumber } from '../../lib/format'
import CountUp from '../ui/CountUp'
import SlotImage from '../ui/SlotImage'

const totalBeds = sites.reduce((n, s) => n + s.beds.length, 0)
const totalArea = sites.reduce((n, s) => n + s.areaSqm, 0)
const STATS = [
  { value: sites.length, label: 'campus sites' },
  { value: totalBeds, label: 'growing beds' },
  { value: totalArea, label: 'm² under crops' },
  { value: crops.length, label: 'crops tracked' },
]

const EASE = [0.22, 1, 0.36, 1] as const

/** Full-width photo (or muted loop) with the headline over it. The photo drifts slower than the page. */
export default function ExploreHero({ mapId }: { mapId: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const [videoFailed, setVideoFailed] = useState(false)
  // Only when the file exists (known at build time), so there is never a failed request.
  const videoSrc = videoAsset(exploreHeroVideo.src)
  const poster = imageAsset(exploreHeroVideo.poster.src)?.src

  // Staggered entrance for the text, skipped when motion is reduced.
  const enter = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease: EASE } }

  return (
    <section
      ref={ref}
      aria-labelledby="explore-heading"
      className="relative isolate flex min-h-[calc(100svh-7.5rem)] flex-col justify-end overflow-hidden bg-ink text-white lg:min-h-[min(88vh,52rem)]"
    >
      <motion.div
        className="absolute inset-0 -z-10"
        style={reduce ? undefined : { y: imageY }}
        initial={reduce ? false : { scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
      >
        <SlotImage slot={exploreHeroImage} tone={0} labelAt="top-right" priority />
        {videoSrc && !reduce && !videoFailed && (
          <video
            className="absolute inset-0 size-full object-cover"
            src={videoSrc}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
            onError={() => setVideoFailed(true)}
          />
        )}
      </motion.div>
      {/* Scrim so white text stays above 4.5:1 over any photo. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink/90 via-ink/55 to-ink/10" aria-hidden />

      <div className="mx-auto w-full max-w-7xl px-4 pt-24 pb-8 lg:px-8 lg:pb-12">
        <div className="max-w-4xl">
          <motion.h1
            id="explore-heading"
            className="font-display text-[clamp(2.75rem,1.6rem+5.4vw,6rem)] leading-[0.98] font-medium tracking-[-0.025em]"
            {...enter(0.1)}
          >
            Four campus gardens. One shared record.
          </motion.h1>
          <motion.p className="mt-5 max-w-2xl text-lg text-white/90 lg:text-xl" {...enter(0.25)}>
            Every harvest, planting and loss at NTU’s food gardens is logged the same way, so what one student committee
            learns, the next one keeps.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.4)}>
            <a
              href={`#${mapId}`}
              className="group inline-flex min-h-12 items-center gap-2 rounded-sm bg-accent px-5 font-semibold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-accent-strong active:translate-y-0"
            >
              Find a site on the map
              <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
            </a>
            <Link
              to="/log/harvest"
              className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-white/70 px-5 font-semibold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
            >
              <ClipboardPen className="size-4" aria-hidden />
              Log a harvest
            </Link>
          </motion.div>
        </div>

        <motion.dl
          className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/30 pt-6 sm:grid-cols-4 lg:mt-16"
          {...enter(0.55)}
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <CountUp
                  value={s.value}
                  format={(n) => formatNumber(Math.round(n))}
                  className="block font-display text-4xl font-medium tabular-nums lg:text-5xl"
                />
                <span className="text-sm text-white/80" aria-hidden>
                  {s.label}
                </span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}
