import { motion, useReducedMotion } from 'motion/react'
import type { GrowthStage } from '../../lib/metrics'

interface Props {
  /** 0 = just planted, 1 = at its typical first-harvest age */
  progress: number
  stage: GrowthStage
  className?: string
  /** Draw itself in (stem, then leaves) the first time it is seen. */
  animate?: boolean
}

/** Leaf pairs revealed in order as the plant grows: [height along stem 0–1, side]. */
const LEAVES: [number, -1 | 1][] = [
  [0.28, -1],
  [0.42, 1],
  [0.58, -1],
  [0.72, 1],
  [0.86, -1],
]

/**
 * A plant in a consistent hand-drawn line style that grows with its progress: a taller stem and more
 * leaves; buds when ready, and a few harvested stems (cut marks) once harvesting.
 */
export default function PlantSprite({ progress, stage, className = '', animate = true }: Props) {
  const reduce = useReducedMotion()
  const p = Math.max(0.05, Math.min(1, progress))
  const ground = 58
  const top = ground - (10 + 40 * p)
  const leafCount = stage === 'seedling' ? 2 : Math.min(LEAVES.length, 1 + Math.round(p * 4))
  const draw = animate && !reduce
  const stem = `M24 ${ground} C ${24 - 2} ${ground - (ground - top) * 0.4}, ${24 + 2} ${ground - (ground - top) * 0.7}, 24 ${top}`

  return (
    <svg
      viewBox="0 0 48 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* soil */}
      <path d="M8 58.5c5-1.2 10-1.4 16-1 6 .4 11 .3 16-.6" />
      <path d="M14 61c3-.5 6-.6 9-.3M28 61.2c2.5-.3 5-.3 7 0" opacity={0.5} />
      <motion.path
        d={stem}
        initial={draw ? { pathLength: 0 } : false}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      {LEAVES.slice(0, leafCount).map(([at, side], i) => {
        const y = ground - (ground - top) * at
        const len = 7 + p * 5
        const x2 = 24 + side * len
        const d = `M24 ${y} C ${24 + side * len * 0.35} ${y - 6}, ${x2} ${y - 6}, ${x2} ${y - 2} C ${x2 - side * 1} ${y + 2}, ${24 + side * len * 0.4} ${y + 2}, 24 ${y}`
        return (
          <motion.path
            key={i}
            d={d}
            fill="currentColor"
            fillOpacity={0.12}
            initial={draw ? { opacity: 0, scale: 0.4 } : false}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
            style={{ transformOrigin: `24px ${y}px` }}
          />
        )
      })}
      {/* top leaf / bud */}
      <path d={`M24 ${top} c -1.5 -3 0 -6 0 -6 c 0 0 1.5 3 0 6`} fill="currentColor" fillOpacity={0.15} />
      {stage === 'ready' && (
        <g className="text-accent" stroke="currentColor">
          <circle cx={21} cy={top - 3} r={1.6} fill="currentColor" />
          <circle cx={27} cy={top - 2} r={1.6} fill="currentColor" />
        </g>
      )}
      {stage === 'harvesting' && (
        <g opacity={0.8}>
          <path d={`M15 ${ground - 4} l2 -6 M33 ${ground - 4} l-2 -6`} />
          <path d={`M15.5 ${ground - 10.5} l3 .8 M30 ${ground - 10.5} l3 -.8`} />
        </g>
      )}
    </svg>
  )
}
