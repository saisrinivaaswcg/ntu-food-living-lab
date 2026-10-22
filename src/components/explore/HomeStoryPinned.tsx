import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionStyle, type MotionValue } from 'motion/react'
import { useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import {
  BEATS,
  CUES,
  easeInOut,
  OUTCOMES_FOCUS_AT,
  OUTCOMES_LIVE_AT,
  progressIn,
  RECORD,
  ROW_TEXT_X,
  rowCentre,
  SCATTER,
  SCENES,
  THUMB_X,
  type StoryEntry,
} from './storyTimeline'
import StoryCard from './StoryCard'
import StoryNote from './StoryNote'
import StoryOutcomes from './StoryOutcomes'
import StoryRecord from './StoryRecord'

const THUMB_PX = RECORD.thumb * 16

/**
 * The home story, pinned (see docs/scrollcraft/builds/home-story/BRIEF.md). One desk holds while the
 * reader scrolls about 0.9 of a screen: four garden photos lie scattered with their committees' notes,
 * the notes drift off, then the cards straighten and slide into one shared record whose rows are the
 * real logs, and the record opens into three outcomes. Only transform and opacity move. The
 * reduced-motion version is HomeStoryStill.
 */
export default function HomeStoryPinned({ entries }: { entries: StoryEntry[] }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: t } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const n = entries.length

  // The cards shrink to exactly the record's thumbnail size, so their drawn width is measured. The record
  // is drawn larger on wide screens (--rs on the desk), and the cards aim at it with the same factor.
  const cardRef = useRef<HTMLDivElement>(null)
  const deskRef = useRef<HTMLDivElement>(null)
  const cardWidth = useMotionValue(160)
  const recordScale = useMotionValue(1)
  useLayoutEffect(() => {
    const card = cardRef.current
    const desk = deskRef.current
    if (!card || !desk) return
    const measure = () => {
      cardWidth.set(card.offsetWidth || 160)
      recordScale.set(parseFloat(getComputedStyle(desk).getPropertyValue('--rs')) || 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(card)
    observer.observe(desk)
    return () => observer.disconnect()
  }, [cardWidth, recordScale])

  const recordOpacity = useTransform(t, (v) => progressIn(v, BEATS.frame) * (1 - progressIn(v, BEATS.open)))
  const recordY = useTransform(t, (v) => `${-2.5 * easeInOut(progressIn(v, BEATS.open))}rem`)
  const recordShrink = useTransform(t, (v) => 1 - 0.08 * easeInOut(progressIn(v, BEATS.open)))
  const thumbs = useTransform(t, [BEATS.collate[1] - 0.05, BEATS.collate[1]], [0, 1])
  const rows = useTransform(t, (v) => progressIn(v, [BEATS.rewrite[0] + 0.04, BEATS.rewrite[1] + 0.02]))
  const thread = useTransform(t, (v) => easeInOut(progressIn(v, BEATS.thread)))

  // Outcomes take clicks only once they're on screen; focusing one scrolls them into view.
  const [live, setLive] = useState(false)
  useMotionValueEvent(t, 'change', (v) => {
    const next = v >= OUTCOMES_LIVE_AT
    if (next !== live) setLive(next)
  })
  const showOutcomes = () => {
    const el = ref.current
    if (!el || t.get() >= OUTCOMES_LIVE_AT) return
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + (el.offsetHeight - window.innerHeight) * OUTCOMES_FOCUS_AT, behavior: 'instant' })
  }
  const outcomeStyles = [useOutcomeStyle(t, 0), useOutcomeStyle(t, 1), useOutcomeStyle(t, 2)]

  return (
    <section
      ref={ref}
      aria-labelledby="story-heading"
      className="relative h-[calc(190svh-7.5rem)] lg:h-[calc(190svh-8rem)] xl:h-[calc(190svh-4rem)]"
    >
      <h2 id="story-heading" className="sr-only">
        From four notebooks to one shared record
      </h2>
      <div className="sticky top-14 h-[calc(100svh-7.5rem-env(safe-area-inset-bottom))] overflow-hidden lg:top-16 lg:h-[calc(100svh-8rem)] xl:h-[calc(100svh-4rem)]">
        <div className="mx-auto flex h-full max-w-7xl flex-col px-4 pt-4 pb-3 lg:flex-row lg:items-center lg:gap-12 lg:px-8 lg:py-10">
          <div className="grid shrink-0 lg:w-5/12">
            {SCENES.map((scene, i) => (
              <Cue key={scene.title} t={t} window={CUES[i]}>
                <h3 className="font-display text-[1.625rem] leading-tight font-medium tracking-[-0.01em] lg:text-5xl">{scene.title}</h3>
                <p className="mt-1.5 text-ink-muted lg:mt-4 lg:text-lg">{scene.text}</p>
              </Cue>
            ))}
          </div>

          <div ref={deskRef} className="relative mt-3 min-h-0 flex-1 [container-type:size] [--rs:1] lg:mt-0 lg:h-full lg:w-7/12 xl:[--rs:1.2]">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ opacity: recordOpacity, y: recordY, scale: recordShrink }}
            >
              <div className="[scale:var(--rs)]">
                <StoryRecord entries={entries} thumbs={thumbs} rows={rows} thread={thread} />
              </div>
            </motion.div>

            {entries.map((entry, i) => (
              <DeskNote key={`note-${entry.site.id}`} entry={entry} i={i} n={n} t={t} />
            ))}
            {entries.map((entry, i) => (
              <DeskCard
                key={entry.site.id}
                entry={entry}
                i={i}
                n={n}
                t={t}
                cardWidth={cardWidth}
                recordScale={recordScale}
                cardRef={i === 0 ? cardRef : undefined}
              />
            ))}

            <div
              className={`absolute inset-x-0 top-1/2 -translate-y-1/2 ${live ? '' : 'pointer-events-none'}`}
            >
              <StoryOutcomes styles={outcomeStyles} onLinkFocus={showOutcomes} tight />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** A scene's words: fade and rise in, hold, fade out. All three share one grid cell. */
function Cue({ t, window: [a, b, c, d], children }: { t: MotionValue<number>; window: [number, number, number, number]; children: ReactNode }) {
  // Function transforms: the windows reach outside 0–1, which keyframe offsets can't.
  const enter = useTransform(t, (v) => progressIn(v, [a, b]))
  const leave = useTransform(t, (v) => progressIn(v, [c, d]))
  const opacity = useTransform([enter, leave], ([e, l]: number[]) => e * (1 - l))
  const y = useTransform([enter, leave], ([e, l]: number[]) => 14 * (1 - e) - 14 * l)
  return (
    <motion.div className="[grid-area:1/1]" style={{ opacity, y }}>
      {children}
    </motion.div>
  )
}

/** A garden's photo: scattered and tilted, then straightened into its row, landing as the row's thumbnail. */
function DeskCard({
  entry,
  i,
  n,
  t,
  cardWidth,
  recordScale,
  cardRef,
}: {
  entry: StoryEntry
  i: number
  n: number
  t: MotionValue<number>
  cardWidth: MotionValue<number>
  recordScale: MotionValue<number>
  cardRef?: Ref<HTMLDivElement>
}) {
  const s = SCATTER[i % SCATTER.length]
  const k = useTransform(t, (v) => easeInOut(progressIn(v, BEATS.collate)))
  const x = useTransform(k, (k) => `calc(${s.x * (1 - k)}cqw + ${k} * var(--rs) * ${THUMB_X})`)
  const y = useTransform(k, (k) => `calc(${s.y * (1 - k)}cqh + ${k * rowCentre(i, n)} * var(--rs) * 1rem)`)
  const rotate = useTransform(k, (k) => s.rotate * (1 - k))
  const scale = useTransform([k, cardWidth, recordScale], ([k, w, rs]: number[]) => 1 + k * ((THUMB_PX * rs) / w - 1))
  const opacity = useTransform(k, [0.82, 1], [1, 0])
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <motion.div ref={cardRef} className="w-[min(42cqw,15rem)] will-change-transform" style={{ x, y, rotate, scale, opacity }}>
        <StoryCard entry={entry} />
      </motion.div>
    </div>
  )
}

/** A committee's note: drifts away from its card (lost at handover), then is gathered into its row and rewritten. */
function DeskNote({ entry, i, n, t }: { entry: StoryEntry; i: number; n: number; t: MotionValue<number> }) {
  const s = SCATTER[i % SCATTER.length]
  const d = useTransform(t, (v) => easeInOut(progressIn(v, BEATS.drift)))
  const m = useTransform(t, (v) => easeInOut(progressIn(v, BEATS.notesIn)))
  const x = useTransform([d, m], ([d, m]: number[]) => `calc(${(s.note.x + (s.drift.x - s.note.x) * d) * (1 - m)}cqw + ${m} * var(--rs) * ${ROW_TEXT_X})`)
  const y = useTransform([d, m], ([d, m]: number[]) => `calc(${(s.note.y + (s.drift.y - s.note.y) * d) * (1 - m)}cqh + ${m * rowCentre(i, n)} * var(--rs) * 1rem)`)
  const rotate = useTransform([d, m], ([d, m]: number[]) => (s.note.rotate + (s.drift.rotate - s.note.rotate) * d) * (1 - m))
  const opacity = useTransform(t, [BEATS.drift[0], BEATS.drift[1], BEATS.rewrite[0], BEATS.rewrite[1]], [1, 0.75, 0.75, 0])
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
      <motion.div className="will-change-transform" style={{ x, y, rotate, opacity }}>
        <StoryNote text={entry.note} siteName={entry.site.name} />
      </motion.div>
    </div>
  )
}

/** An outcome slides out from behind the record: all three start stacked in the middle and spread into rows. */
function useOutcomeStyle(t: MotionValue<number>, i: number): MotionStyle {
  const k = useTransform(t, (v) => 1 - (1 - progressIn(v, BEATS.outcome(i))) ** 3)
  const y = useTransform(k, (k) => `${(1 - k) * (1 - i) * 100}%`)
  const scale = useTransform(k, (k) => 0.94 + 0.06 * k)
  return { y, scale, opacity: k }
}
