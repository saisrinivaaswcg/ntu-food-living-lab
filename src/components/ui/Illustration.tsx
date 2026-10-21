import { useState, type ReactNode } from 'react'
import { imageAsset, type ImageSlot } from '../../data'

interface Props {
  slot: ImageSlot
  /** Shown when the file isn't there (or fails): the SVG drawing, or nothing */
  fallback?: ReactNode
  /** How wide it is drawn, for picking a size from the srcset */
  sizes: string
  /** object-fit: illustrations on paper usually look best uncropped */
  fit?: 'contain' | 'cover'
  priority?: boolean
  className?: string
}

/**
 * An AI illustration slot. When its file exists it loads as resized WebP with a small "AI illustration"
 * credit; otherwise the fallback renders instead. Never a broken image. Fills its (positioned) parent.
 */
export default function Illustration({ slot, fallback = null, sizes, fit = 'contain', priority = false, className = '' }: Props) {
  const asset = imageAsset(slot.src)
  const [failed, setFailed] = useState(false)
  if (!asset || failed) return <>{fallback}</>
  return (
    <figure className={`absolute inset-0 m-0 ${className}`}>
      <img
        src={asset.src}
        srcSet={asset.srcset}
        sizes={sizes}
        alt={slot.alt}
        width={asset.width}
        height={asset.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
        className={`size-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
      />
      {typeof slot.credit === 'string' && (
        <figcaption className="absolute right-1.5 bottom-1.5 rounded-sm bg-surface/85 px-1.5 py-0.5 text-[10px] leading-tight text-ink-muted">
          {slot.credit}
        </figcaption>
      )}
    </figure>
  )
}

