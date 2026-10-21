import { useMotionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import type { Crop } from '../../types'
import { plantDrawing } from './plantDrawings'
import { SOIL_Y } from './plantGeometry'

interface Props {
  crop: Pick<Crop, 'id' | 'form' | 'careGuide'>
  /** Journey progress 0 to 1: a still frame. */
  progress?: number
  /** Or a live scroll value: the drawing grows as it changes (no React re-render per frame). */
  live?: MotionValue<number>
  className?: string
}

/**
 * A crop drawn from shared botanical parts, grown to `progress` (or following `live`). Decorative: the
 * stage it shows is always described in text next to it.
 */
export default function GrowingPlant({ crop, progress = 1, live, className = '' }: Props) {
  const ref = useRef<SVGSVGElement>(null)
  const { parts } = plantDrawing(crop)

  useLayoutEffect(() => {
    ref.current?.style.setProperty('--grow', String(live ? live.get() : progress))
  }, [live, progress])
  // A still frame listens to a value that never changes.
  const still = useMotionValue(progress)
  useMotionValueEvent(live ?? still, 'change', (v) => ref.current?.style.setProperty('--grow', v.toFixed(4)))

  return (
    <svg
      ref={ref}
      viewBox="0 0 200 240"
      className={`overflow-visible ${className}`}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Soil line, drawn by hand: always there */}
      <path
        d={`M18 ${SOIL_Y + 0.5} C50 ${SOIL_Y - 1.5} 80 ${SOIL_Y + 1.5} 112 ${SOIL_Y} S166 ${SOIL_Y - 1} 196 ${SOIL_Y + 0.5}`}
        className="plant-root"
        strokeWidth={1.75}
      />
      <path d={`M40 ${SOIL_Y + 7} h18 M88 ${SOIL_Y + 9} h12 M132 ${SOIL_Y + 6} h20`} className="plant-root" opacity={0.45} />
      {parts.map((part, i) => (
        <path
          key={i}
          d={part.d}
          className={`plant-part plant-${part.paint}`}
          style={
            {
              '--a': part.grow[0],
              '--b': part.grow[1],
              ...(part.fade ? { '--fa': part.fade[0], '--fb': part.fade[1] } : {}),
              transformOrigin: `${part.origin[0]}px ${part.origin[1]}px`,
            } as CSSProperties
          }
        />
      ))}
    </svg>
  )
}
