import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { learnImages } from '../../data'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import type { CropAtNtu } from '../../lib/metrics'
import type { Crop } from '../../types'
import SlotImage from '../ui/SlotImage'
import CropTitle from './CropTitle'
import DayRuler from './DayRuler'
import GrowingPlant from './GrowingPlant'
import { clamp01, JOURNEY_TRAVEL_VH, LEARN_STAGES, PEAK, PLATE_FRAME, progressIn, STAGE_WINDOWS, TITLE_BEAT } from './journey'
import { plantDrawing } from './plantDrawings'
import { TagKeys, TagList, TagThreads } from './SpecimenTags'
import { buildTags } from './tagData'
import StageCopy from './StageCopy'

interface Props {
  crop: Crop
  atNtu: CropAtNtu
  /** Sites growing it now, for the title */
  growingAt: string[]
}

/**
 * The Learn journey as a split stage (see docs/scrollcraft/builds/learn-to-grow/BRIEF.md). The stage
 * pins while the reader scrolls: the plant grows on one side of the divider, the steps change on the
 * other, and a ruler of the crop's real days runs down the middle. At harvest the split collapses: the
 * steps leave, the plant takes the stage and NTU's numbers arrive as specimen tags. Only transform and
 * opacity move. The reduced-motion version is CropJourneyStill.
 */
export default function CropJourney({ crop, atNtu, growingAt }: Props) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: t } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const wide = useMediaQuery('(min-width: 1024px)')
  const drawing = plantDrawing(crop)
  const tags = buildTags(crop, atNtu)

  const collapse = useTransform(t, (v) => ease(progressIn(v, PEAK.collapse)))
  const wordsOpacity = useTransform(collapse, (c) => 1 - c)
  const wordsX = useTransform(collapse, (c) => c * 48)
  const plantX = useTransform(collapse, (c) => `${c * 50}%`)
  const dividerX = useTransform(collapse, (c) => `${-c * 50}%`)
  const tagsLabel = useTransform(collapse, (c) => clamp01(c * 2 - 1))
  // The ghost of the grown plant behind the seed: a back plane that recedes as the title leaves.
  const ghostOpacity = useTransform(t, [0, TITLE_BEAT[1]], [0.16, 0])
  const ghostY = useTransform(t, [0, TITLE_BEAT[1]], [0, -36])
  const plantY = useTransform(t, [0, TITLE_BEAT[1]], [12, 0])

  const plantBox = (size: string) => (
    <div className={`relative aspect-[200/240] ${size}`}>
      <motion.div className="absolute inset-0" style={{ opacity: ghostOpacity, y: ghostY }} aria-hidden>
        <GrowingPlant crop={crop} progress={PLATE_FRAME} className="h-full w-full" />
      </motion.div>
      <motion.div className="absolute inset-0" style={{ y: plantY }}>
        <GrowingPlant crop={crop} live={t} className="h-full w-full" />
        {!wide && <TagKeys tags={tags} anchors={drawing.anchors} progress={t} />}
      </motion.div>
    </div>
  )

  const blocks = (
    <>
      <Cue t={t} window={[0, 0, TITLE_BEAT[1] - 0.035, TITLE_BEAT[1]]}>
        <CropTitle crop={crop} atNtu={atNtu} growingAt={growingAt} compact={!wide} />
      </Cue>
      {LEARN_STAGES.map(({ stage }, i) => {
        const [s0, s1] = STAGE_WINDOWS[stage]
        const start = i === 0 ? TITLE_BEAT[1] - 0.01 : s0 - 0.012
        const last = stage === 'harvest'
        return (
          <Cue key={stage} t={t} window={[start, start + 0.025, last ? 2 : s1 - 0.02, last ? 3 : s1 + 0.008]}>
            <StageCopy crop={crop} stage={stage} />
            {stage === 'ready' && <ReadyPhoto crop={crop} t={t} at={s0} />}
          </Cue>
        )
      })}
    </>
  )

  return (
    <section
      ref={ref}
      aria-labelledby="journey-heading"
      className="relative"
      style={{ height: `${(JOURNEY_TRAVEL_VH + 1) * 100}svh` }}
    >
      <h2 id="journey-heading" className="sr-only">
        Growing {crop.name}, from sowing to harvest
      </h2>
      <div className="sticky top-14 h-[calc(100svh-7.5rem-env(safe-area-inset-bottom))] overflow-hidden lg:top-16 lg:h-[calc(100svh-4rem)]">
        <div className="relative mx-auto h-full max-w-7xl px-4 lg:px-8">
          {wide ? (
            <>
              <motion.div className="absolute inset-y-0 left-0 flex w-1/2 items-center justify-center py-10 pl-8" style={{ x: plantX }}>
                <SideLabel className="absolute top-6 left-8">The plant</SideLabel>
                <TagThreads tags={tags} anchors={drawing.anchors} progress={t}>
                  {plantBox('h-[min(70svh,40rem)]')}
                </TagThreads>
                <motion.p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-demo" style={{ opacity: tagsLabel }}>
                  At NTU, from the platform’s logs (demonstration data)
                </motion.p>
              </motion.div>
              <motion.div className="pointer-events-none absolute inset-0 flex justify-center" style={{ x: dividerX }}>
                <div className="flex h-full w-28 flex-col items-center py-6">
                  <DayRuler crop={crop} t={t} orientation="vertical" />
                </div>
              </motion.div>
              <motion.div className="absolute inset-y-0 right-0 flex w-1/2 items-center pr-8 pl-24" style={{ opacity: wordsOpacity, x: wordsX }}>
                <SideLabel className="absolute top-6 left-24">What you do</SideLabel>
                <div className="grid w-full">{blocks}</div>
              </motion.div>
            </>
          ) : (
            <div className="flex h-full flex-col pt-3 pb-3">
              <div className="relative flex h-[38%] shrink-0 items-center justify-center">
                <SideLabel className="absolute top-0 left-0">The plant</SideLabel>
                {plantBox('h-full')}
              </div>
              <div className="mt-1 shrink-0 border-y border-line py-1.5">
                <DayRuler crop={crop} t={t} orientation="horizontal" />
              </div>
              <div className="relative mt-3 min-h-0 flex-1">
                <motion.div className="absolute inset-0" style={{ opacity: wordsOpacity }}>
                  <SideLabel className="mb-2">What you do</SideLabel>
                  <div className="grid">{blocks}</div>
                </motion.div>
                <motion.div className="absolute inset-0" style={{ opacity: tagsLabel }}>
                  <SideLabel className="mb-2">At NTU</SideLabel>
                  <TagList tags={tags} progress={t} />
                  <p className="mt-2 text-xs text-demo">From the platform’s logs (demonstration data).</p>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const ease = (x: number) => 1 - Math.pow(1 - x, 3)

function SideLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs font-semibold tracking-wide text-ink-muted uppercase ${className}`}>{children}</p>
}

/**
 * Text that is on stage during part of the journey: [in from, in to, out from, out to] in journey t.
 * In from = in to = 0 greets (already there when the page opens). Stacked in one grid cell.
 */
function Cue({ t, window: w, children }: { t: MotionValue<number>; window: [number, number, number, number]; children: ReactNode }) {
  const visibility = (v: number) => {
    const fadeIn = w[1] <= w[0] ? 1 : clamp01((v - w[0]) / (w[1] - w[0]))
    const fadeOut = 1 - clamp01((v - w[2]) / (w[3] - w[2]))
    return Math.min(fadeIn, fadeOut)
  }
  const opacity = useTransform(t, visibility)
  const y = useTransform(t, (v) => {
    const inP = w[1] <= w[0] ? 1 : clamp01((v - w[0]) / (w[1] - w[0]))
    const outP = clamp01((v - w[2]) / (w[3] - w[2]))
    return (1 - inP) * 24 - outP * 24
  })
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? 'auto' : 'none'))
  return (
    <motion.div className="col-start-1 row-start-1" style={{ opacity, y, pointerEvents }}>
      {children}
    </motion.div>
  )
}

/** What "ready" looks like, for real: a wipe (a paper cover sliding away) uncovers the photo. */
function ReadyPhoto({ crop, t, at }: { crop: Crop; t: MotionValue<number>; at: number }) {
  const slot = learnImages[crop.id]
  const cover = useTransform(t, (v) => `${-ease(progressIn(v, [at + 0.004, at + 0.05])) * 101}%`)
  if (!slot) return null
  return (
    <figure className="mt-3 max-w-md lg:mt-4">
      <div className="relative aspect-[21/9] overflow-hidden rounded-sm lg:aspect-[4/3]">
        <SlotImage slot={slot} caption="top" sizes="(min-width: 1024px) 28rem, 90vw" />
        <motion.div className="absolute inset-0 bg-canvas" style={{ y: cover }} aria-hidden />
      </div>
      <figcaption className="mt-1.5 hidden text-sm text-ink-muted lg:block">{crop.careGuide.readySign}</figcaption>
    </figure>
  )
}
