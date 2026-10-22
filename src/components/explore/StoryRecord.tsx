import { motion, type MotionValue } from 'motion/react'
import SlotImage from '../ui/SlotImage'
import { RECORD, type StoryEntry } from './storyTimeline'

interface Props {
  entries: StoryEntry[]
  /** Pinned story only: the thumbnails, log rows and green thread arrive on these. Static when omitted. */
  thumbs?: MotionValue<number>
  rows?: MotionValue<number>
  thread?: MotionValue<number>
}

/**
 * The shared record: one card, one row per garden in the same shape (date · kind · crop · weight), from
 * each site's latest harvest. A forest-green thread ties the gardens together. Heights match RECORD in
 * homeStory.ts, which the pinned cards aim at.
 */
export default function StoryRecord({ entries, thumbs, rows, thread }: Props) {
  return (
    <div className="rounded-card bg-surface shadow-float" style={{ width: RECORD.width }}>
      <div className="flex h-[2.75rem] items-center justify-between gap-3 border-b border-line px-3">
        <p className="font-display text-lg font-medium">Shared record</p>
        <p className="truncate text-xs text-demo">Latest harvests · demo data</p>
      </div>
      <ol className="relative px-3 pb-3">
        {entries.length > 1 && (
          <motion.span
            className="absolute top-[1.875rem] left-[calc(2.125rem-1px)] w-0.5 origin-top bg-brand-700"
            style={{ height: `${(entries.length - 1) * RECORD.row}rem`, scaleY: thread }}
            aria-hidden
          />
        )}
        {entries.map((e) => (
          <li key={e.site.id} className="relative flex h-[3.75rem] items-center gap-3">
            <motion.span className="relative size-11 shrink-0 overflow-hidden rounded-[3px] ring-2 ring-surface" style={{ opacity: thumbs }}>
              <SlotImage slot={e.slot} tone={1} caption="none" sizes="48px" />
            </motion.span>
            <motion.div className="min-w-0 text-sm leading-snug" style={{ opacity: rows }}>
              <p className="truncate font-semibold">{e.site.name}</p>
              <p className="truncate text-ink-muted tabular-nums">
                {e.row ? (
                  <>
                    {e.row.date} · Harvest · {e.row.crop} · {e.row.kg}
                  </>
                ) : (
                  'No harvest logged yet'
                )}
              </p>
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  )
}
