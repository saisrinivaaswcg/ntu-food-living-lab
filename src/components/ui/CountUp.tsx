import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

interface Props {
  value: number
  /** Turns the in-between numbers into text, e.g. (n) => formatNumber(n, 1). */
  format: (n: number) => string
  className?: string
}

/**
 * Counts up from zero the first time it scrolls into view. Screen readers get the final value only;
 * with reduced motion the final value is shown straight away.
 */
export default function CountUp({ value, format, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  // Callers pass inline formatters; keep the latest without restarting the animation on every render.
  const formatRef = useRef(format)
  useEffect(() => {
    formatRef.current = format
  })

  useEffect(() => {
    const format = formatRef.current
    const el = ref.current
    if (!el) return
    if (reduce || !inView) {
      el.textContent = reduce ? format(value) : format(0)
      return
    }
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => {
        el.textContent = format(n)
      },
      onComplete: () => {
        el.textContent = format(value)
      },
    })
    return () => controls.stop()
  }, [inView, reduce, value])

  return (
    <span className={className}>
      <span ref={ref} aria-hidden>
        {format(reduce ? value : 0)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  )
}
