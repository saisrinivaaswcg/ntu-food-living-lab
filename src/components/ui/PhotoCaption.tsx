import type { ImageSlot } from '../../data'

/**
 * "Representative photo" and "Photo: Author · Licence" chips for a slot whose photo is in place.
 * Links to each source and licence are on the Photo credits page (/credits).
 * `line`: one line of small text on paper instead of chips, for photos too small to carry chips.
 */
export default function PhotoCaption({ slot, className = '', variant = 'chips' }: { slot: ImageSlot; className?: string; variant?: 'chips' | 'line' }) {
  if (!slot.representative && !slot.credit) return null
  if (variant === 'line') {
    const by = typeof slot.credit === 'string' ? ` (${slot.credit})` : slot.credit ? ` by ${slot.credit.author}, ${slot.credit.license}` : ''
    return <p className={`text-[11px] leading-tight font-normal text-ink-muted ${className}`}>{`${slot.representative ? 'Representative photo' : 'Photo'}${by}`}</p>
  }
  return (
    <div className={`pointer-events-none flex flex-wrap items-center justify-end gap-1.5 text-xs leading-tight text-white ${className}`}>
      {slot.representative && <span className="rounded-sm bg-ink/75 px-1.5 py-0.5 font-semibold">Representative photo</span>}
      {typeof slot.credit === 'string' ? (
        <span className="rounded-sm bg-ink/75 px-1.5 py-0.5">{slot.credit}</span>
      ) : (
        slot.credit && (
          <span className="rounded-sm bg-ink/75 px-1.5 py-0.5">
            Photo: {slot.credit.author} · {slot.credit.license}
          </span>
        )
      )}
    </div>
  )
}
