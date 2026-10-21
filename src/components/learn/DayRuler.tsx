import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import type { Crop } from '../../types'
import { dayAt, LEARN_STAGES, stageAt } from './journey'

interface Props {
  crop: Crop
  t: MotionValue<number>
  orientation: 'vertical' | 'horizontal'
}

/** Tick spacing that gives 5 to 10 ticks for the crop's season. */
function tickStep(days: number): number {
  return [5, 10, 20, 30, 60].find((s) => days / s <= 10) ?? 60
}

/**
 * The split's divider: a ruler of the crop's real days to first harvest, the day the drawing is at, and
 * the five stage names with the current one marked. The marker moves with transform only; the day
 * number and stage are written straight into the DOM when they change (no re-render per frame).
 */
export default function DayRuler({ crop, t, orientation }: Props) {
  const total = crop.careGuide.stageDays.harvest
  const step = tickStep(total)
  const ticks = Array.from({ length: Math.floor(total / step) + 1 }, (_, i) => i * step)
  const dayRef = useRef<HTMLSpanElement>(null)
  const stagesRef = useRef<HTMLOListElement>(null)
  const vertical = orientation === 'vertical'

  // A full-length layer slid by its own size: translate 100% = the far end of the ruler.
  const along = useTransform(t, (v) => `${(dayAt(v, crop) / total) * 100}%`)

  useMotionValueEvent(t, 'change', (v) => {
    if (dayRef.current) dayRef.current.textContent = String(dayAt(v, crop))
    const current = stageAt(v)
    stagesRef.current?.querySelectorAll<HTMLElement>('[data-stage]').forEach((el) => {
      const on = el.dataset.stage === current
      el.dataset.current = on ? 'true' : 'false'
      if (on) el.setAttribute('aria-current', 'step')
      else el.removeAttribute('aria-current')
    })
  })

  const first = stageAt(t.get())
  const readout = (
    <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase" aria-live="off">
      Day{' '}
      <span ref={dayRef} className="font-display text-2xl font-medium text-ink tabular-nums normal-case">
        {dayAt(t.get(), crop)}
      </span>
      <span className="sr-only"> of about {total} days to first harvest</span>
    </p>
  )
  const stages = (
    <ol ref={stagesRef} className={`flex text-xs font-semibold ${vertical ? 'flex-col items-center gap-1' : 'gap-0.5'}`}>
      {LEARN_STAGES.map(({ stage, label }) => (
        <li
          key={stage}
          data-stage={stage}
          data-current={stage === first ? 'true' : 'false'}
          aria-current={stage === first ? 'step' : undefined}
          className="rounded-full px-1.5 py-0.5 text-ink-muted data-[current=true]:bg-ink data-[current=true]:text-canvas"
        >
          {label}
        </li>
      ))}
    </ol>
  )
  const marker = (
    <motion.span className={`absolute ${vertical ? 'inset-x-0 top-0 h-full' : 'inset-y-0 left-0 w-full'}`} style={vertical ? { y: along } : { x: along }}>
      <span
        className={`absolute size-3.5 rounded-full border-2 border-surface bg-accent shadow-card ${
          vertical ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' : 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2'
        }`}
      />
    </motion.span>
  )

  if (!vertical) {
    // Phones: day and stages on one row, the rule under them with only its two ends numbered.
    return (
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          {readout}
          {stages}
        </div>
        <div className="relative mx-2 h-5" aria-hidden>
          <span className="absolute inset-x-0 top-1/2 h-px bg-ink" />
          {ticks.map((d) => (
            <span key={d} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-ink-muted" style={{ left: `${(d / total) * 100}%` }} />
          ))}
          {marker}
        </div>
        <p className="flex justify-between px-1 text-[10px] text-ink-muted tabular-nums" aria-hidden>
          <span>0</span>
          <span>{total} days</span>
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center gap-3 py-2">
      {readout}
      <div className="relative w-10 flex-1" aria-hidden>
        <span className="absolute inset-y-0 left-1/2 w-px bg-ink" />
        {ticks.map((d) => (
          <span
            key={d}
            className="absolute left-1/2 flex -translate-y-1/2 items-center gap-1 text-[10px] text-ink-muted tabular-nums"
            style={{ top: `${(d / total) * 100}%` }}
          >
            <span className="h-px w-2 bg-ink-muted" />
            <span>{d}</span>
          </span>
        ))}
        {marker}
      </div>
      {stages}
    </div>
  )
}
