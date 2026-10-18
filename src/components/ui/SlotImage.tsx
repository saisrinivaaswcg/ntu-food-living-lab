import { useState } from 'react'
import { imageAsset, type ImageSlot } from '../../data'
import PhotoCaption from './PhotoCaption'

/** Placeholder tones, all from the palette. Pick one per slot so neighbouring cards differ. */
const PLACEHOLDER_TONES = [
  'from-brand-900 via-brand-700 to-brand-400',
  'from-brand-900 via-brand-600 to-series-water',
  'from-ink via-brand-800 to-brand-300',
  'from-brand-800 via-brand-600 to-brand-200',
] as const

interface Props {
  slot: ImageSlot
  /** Big text on the placeholder, e.g. the site name. Omit for a quieter placeholder. */
  title?: string
  tone?: number
  /** Image + placeholder zoom slightly when an ancestor with `group` is hovered. */
  zoomOnHover?: boolean
  /** Above-the-fold images load eagerly. */
  priority?: boolean
  /** How wide the image is drawn, for choosing a size from the srcset. */
  sizes?: string
  /** Where the "Photo placeholder" label sits; top-right keeps it clear of text laid over the slot. */
  labelAt?: 'bottom-left' | 'top-right'
  /** Extra classes for the placeholder, e.g. more padding when the slot is oversized for zooming. */
  placeholderClassName?: string
  /** Credit and "Representative photo" chips. 'none' when the caller shows <PhotoCaption> itself (moving heroes). */
  caption?: 'bottom' | 'top' | 'none'
  className?: string
}

/**
 * A photo slot that never shows a broken image. When the file exists, a resized WebP loads lazily over a
 * blurred tiny preview (blur-up). When it doesn't, a labelled gradient placeholder shows instead.
 * Fills its (positioned) parent.
 */
export default function SlotImage({
  slot,
  title,
  tone = 0,
  zoomOnHover = false,
  priority = false,
  sizes = '100vw',
  labelAt = 'bottom-left',
  placeholderClassName = '',
  caption = 'bottom',
  className = '',
}: Props) {
  const asset = imageAsset(slot.src)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const zoom = zoomOnHover
    ? 'transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100'
    : ''

  if (!asset || failed) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <div
          role="img"
          aria-label={`Photo placeholder: ${slot.alt}`}
          className={`absolute inset-0 flex flex-col bg-linear-to-tr p-5 ${labelAt === 'top-right' ? 'items-end justify-start' : 'justify-end'} ${PLACEHOLDER_TONES[tone % PLACEHOLDER_TONES.length]} ${zoom} ${placeholderClassName}`}
        >
          {title && (
            <span className="max-w-[16ch] font-display text-2xl leading-tight font-medium text-white sm:text-3xl" aria-hidden>
              {title}
            </span>
          )}
          <span className="mt-1 text-xs font-medium tracking-wide text-white/80" aria-hidden>
            Photo placeholder
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`absolute inset-0 overflow-hidden bg-sunken ${className}`}>
      {/* Blur-up: the inline 24px preview, scaled and blurred, until the real image has loaded. */}
      {asset.blur && !loaded && (
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center blur-xl"
          style={{ backgroundImage: `url(${asset.blur})`, backgroundPosition: slot.focus }}
          aria-hidden
        />
      )}
      <img
        src={asset.src}
        srcSet={asset.srcset}
        sizes={sizes}
        alt={slot.alt}
        width={asset.width}
        height={asset.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        style={{ objectPosition: slot.focus }}
        // Priority (hero) photos show as soon as they paint; others fade in over the blur-up preview.
        className={`absolute inset-0 size-full object-cover ${
          priority ? '' : `transition-opacity duration-500 motion-reduce:transition-none ${loaded ? 'opacity-100' : 'opacity-0'}`
        } ${zoom}`}
      />
      {caption !== 'none' && (
        <PhotoCaption slot={slot} className={`absolute inset-x-0 p-2 ${caption === 'top' ? 'top-0' : 'bottom-0'}`} />
      )}
    </div>
  )
}
