import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Seconds to wait after entering the viewport, for staggering siblings. */
  delay?: number
  /** Distance to rise from, in px. */
  y?: number
  className?: string
  as?: 'div' | 'li' | 'section'
}

/** Fades and rises into place the first time it scrolls into view. Static when motion is reduced. */
export default function Reveal({ children, delay = 0, y = 24, className, as = 'div' }: Props) {
  const reduce = useReducedMotion()
  if (reduce) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}
