import type { ImageSlot } from '../../data'

/**
 * "Representative photo" and "Photo: Author · Licence" chips for a slot whose photo is in place.
 * Links to each source and licence are on the Photo credits page (/credits).
 */
export default function PhotoCaption({ slot, className = '' }: { slot: ImageSlot; className?: string }) {
  if (!slot.representative && !slot.credit) return null
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
