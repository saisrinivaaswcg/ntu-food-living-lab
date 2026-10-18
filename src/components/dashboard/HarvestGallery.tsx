import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { destinationOptions } from '../../data'
import { formatDate } from '../../lib/dates'
import { formatNumber } from '../../lib/format'
import { cropName, getBed, siteName } from '../../lib/lookups'
import type { HarvestLog } from '../../types'
import PhotoThumb from './PhotoThumb'

const PAGE = 12

function describe(h: HarvestLog): string {
  return `${cropName(h.cropId)}, ${formatNumber(h.weightKg, 2)} kg, ${siteName(h.siteId, true)}, ${formatDate(h.date)}`
}

/** Grid of harvest photos, newest first; select one to see it large with its record. */
export default function HarvestGallery({ harvests }: { harvests: HarvestLog[] }) {
  const [shown, setShown] = useState(PAGE)
  const [open, setOpen] = useState<HarvestLog | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)

  // Native <dialog>: focus is trapped inside, Escape closes it, and the page behind is inert.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function close() {
    setOpen(null)
    openerRef.current?.focus()
  }

  const destination = open ? destinationOptions.find((d) => d.value === open.destination)?.label : ''

  return (
    <div>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {harvests.slice(0, shown).map((h) => (
          <li key={h.id}>
            <button
              type="button"
              onClick={(e) => {
                openerRef.current = e.currentTarget
                setOpen(h)
              }}
              aria-label={`Enlarge photo: ${describe(h)}`}
              className="group relative block aspect-square w-full overflow-hidden rounded-sm"
            >
              <span className="block size-full transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none">
                <PhotoThumb photo={h.photo} alt="" />
              </span>
              <span
                className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/80 to-transparent px-2 pt-6 pb-1.5 text-left text-xs leading-tight text-white"
                aria-hidden
              >
                <span className="block truncate font-semibold">{cropName(h.cropId)}</span>
                <span className="tabular-nums">{formatNumber(h.weightKg, 2)} kg</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {harvests.length > shown && (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="mt-4 min-h-12 rounded-sm border border-line-strong px-4 font-semibold transition-colors hover:bg-sunken"
        >
          Show more photos ({harvests.length - shown} left)
        </button>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => open && close()}
        onClick={(e) => e.target === e.currentTarget && close()}
        aria-label={open ? `Harvest photo: ${describe(open)}` : 'Harvest photo'}
        className="m-auto w-[min(48rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-3xl bg-surface p-0 text-ink shadow-float backdrop:bg-ink/75"
      >
        {open && (
          <div>
            <div className="relative aspect-[4/3] bg-sunken">
              <PhotoThumb
                photo={open.photo}
                alt={open.photo.kind === 'upload' ? `Harvest photo: ${describe(open)}` : ''}
                large
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close photo"
                className="absolute top-3 right-3 flex size-12 items-center justify-center rounded-full bg-surface/90 text-ink shadow-float transition-transform hover:scale-105"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 p-5 sm:grid-cols-4">
              <div>
                <dt className="text-sm text-ink-muted">Crop</dt>
                <dd className="font-semibold">{cropName(open.cropId)}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Weight</dt>
                <dd className="font-semibold tabular-nums">{formatNumber(open.weightKg, 2)} kg</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Site and bed</dt>
                <dd className="font-semibold">
                  {siteName(open.siteId, true)} · {getBed(open.siteId, open.bedId)?.label ?? open.bedId}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Date, went to</dt>
                <dd className="font-semibold">
                  {formatDate(open.date)} · {destination}
                </dd>
              </div>
              {open.notes && (
                <div className="col-span-full">
                  <dt className="text-sm text-ink-muted">Notes</dt>
                  <dd>{open.notes}</dd>
                </div>
              )}
              {open.source === 'demo' && <p className="col-span-full text-sm text-demo">Demonstration record.</p>}
            </dl>
          </div>
        )}
      </dialog>
    </div>
  )
}
