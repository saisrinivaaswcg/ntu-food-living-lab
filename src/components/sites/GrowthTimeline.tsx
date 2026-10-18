import { motion, useReducedMotion } from 'motion/react'
import { formatShortDate } from '../../lib/dates'
import { cropName, siteName } from '../../lib/lookups'
import { GROWTH_STAGES, type GrowthTimeline as Timeline } from '../../lib/metrics'
import PlantSprite from '../illustrations/PlantSprite'

/** The track runs from planting to a little past the expected first harvest. */
const TRACK_END = 1.35
const pos = (x: number) => `${(Math.max(0, Math.min(TRACK_END, x)) / TRACK_END) * 100}%`

function statusLine(t: Timeline): string {
  if (t.stage === 'harvesting') {
    return t.lastHarvest ? `Harvesting · last picked ${formatShortDate(t.lastHarvest)}` : 'Harvesting'
  }
  if (t.daysToExpected === null) return 'No typical harvest time for this crop'
  if (t.daysToExpected < 0) return `First harvest ${-t.daysToExpected} days overdue`
  if (t.daysToExpected === 0) return 'First harvest due today'
  return `First harvest in ${t.daysToExpected} ${t.daysToExpected === 1 ? 'day' : 'days'}`
}

/**
 * Planted date → expected first harvest, with stage markers, a "today" marker and a plant drawing
 * that grows with progress. Static when motion is reduced.
 */
export default function GrowthTimeline({ timeline: t, showSite = false }: { timeline: Timeline; showSite?: boolean }) {
  const reduce = useReducedMotion()
  const planting = t.status.planting
  if (!planting) return null
  const today = Math.min(t.progress, TRACK_END)

  return (
    <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-end gap-4">
      <PlantSprite progress={t.progress} stage={t.stage} className="h-[4.5rem] w-14 text-brand-700" />
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="font-display text-xl font-medium">{cropName(planting.cropId)}</span>
          <span className="text-sm text-ink-muted">
            {showSite && `${siteName(t.siteId, true)} · `}
            {t.status.bed.label}
          </span>
        </p>
        <p className={`text-sm ${t.daysToExpected !== null && t.daysToExpected < 0 && t.stage !== 'harvesting' ? 'font-semibold text-attention' : 'text-ink-muted'}`}>
          {statusLine(t)}
        </p>

        <div className="relative mt-6 h-2 rounded-full bg-brand-100" role="img" aria-label={`${cropName(planting.cropId)}: ${statusLine(t)}`}>
          <motion.div
            className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-brand-700"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: today / TRACK_END }}
            animate={reduce ? { scaleX: today / TRACK_END } : undefined}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          {GROWTH_STAGES.filter((s) => s.from > 0).map((s) => (
            // "Ready" sits left of its tick and "Harvesting" at the track's end, so the close ticks never collide.
            <span
              key={s.stage}
              className={`absolute -top-5 text-xs font-medium whitespace-nowrap text-ink-muted ${
                s.stage === 'ready' ? '-translate-x-full pr-1' : s.stage === 'harvesting' ? 'right-0' : '-translate-x-1/2'
              }`}
              style={s.stage === 'harvesting' ? undefined : { left: pos(s.from) }}
              aria-hidden
            >
              {s.label}
            </span>
          ))}
          {GROWTH_STAGES.filter((s) => s.from > 0).map((s) => (
            <span key={`${s.stage}-tick`} className="absolute -top-1 h-4 w-px bg-line-strong" style={{ left: pos(s.from) }} aria-hidden />
          ))}
          <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent shadow-float" style={{ left: pos(today) }} aria-hidden />
        </div>
        <p className="mt-2 flex flex-wrap justify-between gap-x-3 text-xs text-ink-muted tabular-nums">
          <span>Planted {formatShortDate(planting.date)}</span>
          <span>
            <span className="mr-1 inline-block size-2 rounded-full bg-accent align-middle" aria-hidden />
            Today
            {t.status.expectedFirstHarvest && ` · expected ${formatShortDate(t.status.expectedFirstHarvest)}`}
          </span>
        </p>
      </div>
    </div>
  )
}
