import type { CSSProperties } from 'react'

interface Props {
  label: string
  className?: string
  style?: CSSProperties
}

/** Placeholder block while a chart or the map loads. Shimmers gently unless motion is reduced. */
export default function Skeleton({ label, className = '', style }: Props) {
  return (
    <div role="status" aria-label={label} style={style} className={`relative overflow-hidden rounded-sm bg-sunken ${className}`}>
      <div className="absolute inset-0 animate-pulse bg-linear-to-r from-transparent via-surface/60 to-transparent motion-reduce:animate-none" />
    </div>
  )
}
