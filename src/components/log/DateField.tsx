import { CalendarDays } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatDate, todayISO } from '../../lib/dates'
import { describedBy } from '../../lib/forms'
import type { ISODate } from '../../types'

interface Props {
  id: string
  value: ISODate
  onChange: (value: ISODate) => void
  error?: string
}

/** Defaults to today and stays collapsed ("Today · change") until tapped. */
export default function DateField({ id, value, onChange, error }: Props) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const today = todayISO()

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  if (!open && !error) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Date: ${value === today ? 'today' : formatDate(value)}. Change date`}
        className="-mr-2 inline-flex min-h-12 items-center gap-1.5 rounded-lg px-2 text-sm text-ink-muted hover:bg-surface"
      >
        <CalendarDays className="size-4" aria-hidden />
        <span className="font-medium text-ink">{value === today ? 'Today' : formatDate(value)}</span>
        <span aria-hidden>·</span>
        <span className="text-brand-700 underline underline-offset-2">change</span>
      </button>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          Date
        </label>
        <input
          ref={inputRef}
          id={id}
          type="date"
          value={value}
          max={today}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, undefined, error)}
          className="min-h-12 rounded-xl border border-line bg-surface px-3 text-base text-ink focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30 aria-[invalid=true]:border-danger"
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
