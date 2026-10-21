import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { clamp01, PEAK } from './journey'
import type { TagAnchors } from './plantDrawings'
import type { Tag, TagKey } from './tagData'

/**
 * The signature move: when the plant is ready, NTU's own numbers arrive as paper tags tied to the part
 * of the plant they describe. Desktop ties them on with threads; phones list them under the plant with
 * lettered keys on the drawing. Numbers come from the logs (demo data here) and appear, never count up.
 */

/** Where each tag sits, in the drawing's 200 × 240 units (threads layout). */
const TAG_SPOTS: Record<TagKey, { side: 'left' | 'right'; y: number }> = {
  top: { side: 'left', y: 52 },
  stem: { side: 'left', y: 150 },
  leaf: { side: 'right', y: 82 },
  base: { side: 'right', y: 190 },
}
const THREAD_GAP = 34


interface TagProps {
  tags: Tag[]
  /** Journey progress: tags arrive across the peak's tag window. Omit for a still frame (all shown). */
  progress?: MotionValue<number>
}

/** When each tag arrives, in journey t. */
function arrivals(count: number): number[] {
  const [from, to] = PEAK.tags
  return Array.from({ length: count }, (_, i) => from + ((to - from) / count) * i)
}

/** Desktop: tags hang around the drawing (its children) on threads tied to the parts they describe. */
export function TagThreads({ tags, anchors, progress, children }: TagProps & { anchors: TagAnchors; children: ReactNode }) {
  const still = useMotionValue(1)
  const t = progress ?? still
  const at = arrivals(tags.length)
  return (
    <div className="relative">
      {children}
      {/* Threads, drawn in the plant's own units so they meet the right part */}
      <svg viewBox="0 0 200 240" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {tags.map((tag, i) => {
          const spot = TAG_SPOTS[tag.key]
          const [ax, ay] = anchors[tag.key]
          const ex = spot.side === 'left' ? -THREAD_GAP : 200 + THREAD_GAP
          return (
            <Arrive key={tag.key} t={t} at={at[i]} svg>
              <path
                d={`M${ax} ${ay} Q${(ax + ex) / 2} ${(ay + spot.y) / 2 + 10} ${ex} ${spot.y}`}
                fill="none"
                stroke="var(--color-ink-subtle)"
                strokeWidth={1}
                strokeDasharray="2 3"
              />
              <circle cx={ax} cy={ay} r={2.6} fill="var(--color-accent)" />
            </Arrive>
          )
        })}
      </svg>
      <ul>
        {tags.map((tag, i) => {
          const spot = TAG_SPOTS[tag.key]
          const edge = `${100 + (THREAD_GAP / 200) * 100}%`
          return (
            <Arrive
              key={tag.key}
              t={t}
              at={at[i]}
              as="li"
              className="absolute w-48 -translate-y-1/2 xl:w-52"
              style={{ top: `${(spot.y / 240) * 100}%`, ...(spot.side === 'left' ? { right: edge } : { left: edge }) }}
            >
              <TagCard tag={tag} />
            </Arrive>
          )
        })}
      </ul>
    </div>
  )
}

/** Phones: lettered keys on the drawing (overlay; place inside the drawing's box). */
export function TagKeys({ tags, anchors, progress }: TagProps & { anchors: TagAnchors }) {
  const still = useMotionValue(1)
  const t = progress ?? still
  const at = arrivals(tags.length)
  return (
    <svg viewBox="0 0 200 240" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      {tags.map((tag, i) => {
        const [ax, ay] = anchors[tag.key]
        return (
          <Arrive key={tag.key} t={t} at={at[i]} svg>
            <circle cx={ax} cy={ay} r={9} fill="var(--color-accent)" />
            <text x={ax} y={ay + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="white" fontFamily="inherit">
              {tag.letter}
            </text>
          </Arrive>
        )
      })}
    </svg>
  )
}

/** Phones: the tags as a grid, keyed to the letters on the drawing. */
export function TagList({ tags, progress }: TagProps) {
  const still = useMotionValue(1)
  const t = progress ?? still
  const at = arrivals(tags.length)
  return (
    <ul className="grid grid-cols-2 gap-2">
      {tags.map((tag, i) => (
        <Arrive key={tag.key} t={t} at={at[i]} as="li">
          <TagCard tag={tag} showLetter />
        </Arrive>
      ))}
    </ul>
  )
}

export function TagCard({ tag, showLetter = false }: { tag: Tag; showLetter?: boolean }) {
  return (
    <div className="relative rounded-sm border border-line-strong bg-surface py-2 pr-3 pl-6 shadow-card">
      {/* The punched hole a tag hangs from */}
      <span className="absolute top-1/2 left-2 size-2 -translate-y-1/2 rounded-full border border-line-strong bg-canvas" aria-hidden />
      <p className="flex items-baseline gap-1.5">
        {showLetter && (
          <span className="flex size-5 shrink-0 items-center justify-center self-center rounded-full bg-accent text-xs font-bold text-white" aria-hidden>
            {tag.letter}
          </span>
        )}
        <span className="font-display text-lg leading-tight font-medium tabular-nums lg:text-2xl">{tag.figure}</span>
      </p>
      <p className="text-sm font-semibold leading-snug">{tag.label}</p>
      <p className="mt-0.5 line-clamp-3 text-xs leading-snug text-ink-muted">{tag.detail}</p>
    </div>
  )
}

/** Fades and rises in as the journey passes `at`; holds after. */
function Arrive({
  t,
  at,
  svg = false,
  as = 'div',
  className,
  style,
  children,
}: {
  t: MotionValue<number>
  at: number
  svg?: boolean
  as?: 'div' | 'li'
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const ramp = 0.035
  const opacity = useTransform(t, (v) => clamp01((v - at) / ramp))
  const y = useTransform(t, (v) => (1 - clamp01((v - at) / ramp)) * 10)
  if (svg) return <motion.g style={{ opacity }}>{children}</motion.g>
  const Tag = as === 'li' ? motion.li : motion.div
  return (
    <Tag className={className} style={{ ...style, opacity, y }}>
      {children}
    </Tag>
  )
}
