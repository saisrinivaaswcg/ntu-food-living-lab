import { useEffect, useRef } from 'react'

interface Props {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  /** Red confirm button for things that can't be undone. */
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** A modal yes/no question (native <dialog>: focus trap and Escape for free). */
export default function ConfirmDialog({ open, title, body, confirmLabel, danger = false, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onClose={onCancel}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-card bg-surface p-6 text-ink shadow-float backdrop:bg-ink/40"
    >
      <h2 id="confirm-title" className="font-display text-2xl font-medium">
        {title}
      </h2>
      <p className="mt-2 text-ink-muted">{body}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-12 rounded-sm border border-line-strong px-5 font-semibold hover:bg-sunken"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`min-h-12 rounded-sm px-5 font-semibold text-white ${danger ? 'bg-danger hover:opacity-90' : 'bg-brand-700 hover:bg-brand-800'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
