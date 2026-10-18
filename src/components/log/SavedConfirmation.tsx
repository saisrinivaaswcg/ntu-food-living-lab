import { BarChart3, CircleCheck, Plus, Undo2 } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { jumpToTop } from '../../lib/smoothScroll'

interface Props {
  title: string
  rows: [label: string, value: string][]
  photoUrl?: string
  anotherLabel: string
  onAnother: () => void
  onUndo: () => void
}

/** Shown after a successful save: summary, Undo, log another, view dashboard. */
export default function SavedConfirmation({ title, rows, photoUrl, anotherLabel, onAnother, onUndo }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    jumpToTop()
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <section aria-labelledby="saved-heading" className="rounded-2xl bg-surface p-5 shadow-float lg:p-6">
      <div className="flex items-center gap-3">
        <motion.span
          className="shrink-0 text-brand-700"
          initial={reduce ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          aria-hidden
        >
          <CircleCheck className="size-9" />
        </motion.span>
        <h1 id="saved-heading" ref={headingRef} tabIndex={-1} className="font-display text-3xl font-medium outline-none">
          {title}
        </h1>
      </div>
      <p className="mt-1 text-sm text-ink-muted">Saved on this device. It's already counted on the dashboard.</p>

      <div className="mt-4 flex gap-3">
        <dl className="grid min-w-0 flex-1 grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="min-w-0 break-words font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        {photoUrl && <img src={photoUrl} alt="Saved photo" className="size-20 shrink-0 rounded-sm object-cover" />}
      </div>

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          onClick={onAnother}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-4 font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-accent-strong active:scale-[0.98] motion-reduce:active:scale-100"
        >
          <Plus className="size-5" aria-hidden />
          {anotherLabel}
        </button>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onUndo}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-line-strong px-3 font-semibold text-ink transition-colors hover:bg-sunken"
          >
            <Undo2 className="size-4" aria-hidden />
            Undo
          </button>
          <Link
            to="/dashboard"
            className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-line-strong px-3 font-semibold text-ink transition-colors hover:bg-sunken"
          >
            <BarChart3 className="size-4" aria-hidden />
            View dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}
