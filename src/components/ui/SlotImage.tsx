import { useState } from 'react'
import type { ImageSlot } from '../../data'

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
  /** Where the "Photo placeholder" label sits; top-right keeps it clear of text laid over the slot. */
  labelAt?: 'bottom-left' | 'top-right'
  className?: string
}

/**
 * A photo slot that never shows a broken image: a labelled gradient sits underneath, and the photo
 * fades in over it only once it has loaded. Fills its (positioned) parent.
 */
export default function SlotImage({
  slot,
  title,
  tone = 0,
  zoomOnHover = false,
  priority = false,
  labelAt = 'bottom-left',
  className = '',
}: Props) {
  const [state, setState] = useState<'loading' | 'loaded' | 'missing'>('loading')
  const zoom = zoomOnHover
    ? 'transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100'
    : ''

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {state !== 'loaded' && (
        <div
          role={state === 'missing' ? 'img' : undefined}
          aria-label={state === 'missing' ? `Photo placeholder: ${slot.alt}` : undefined}
          className={`absolute inset-0 flex flex-col bg-linear-to-tr p-5 ${labelAt === 'top-right' ? 'items-end justify-start' : 'justify-end'} ${PLACEHOLDER_TONES[tone % PLACEHOLDER_TONES.length]} ${zoom}`}
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
      )}
      {state !== 'missing' && (
        <img
          src={slot.src}
          alt={slot.alt}
          width={slot.width}
          height={slot.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('missing')}
          style={{ objectPosition: slot.focus }}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${
            state === 'loaded' ? 'opacity-100' : 'opacity-0'
          } ${zoom}`}
        />
      )}
    </div>
  )
}
