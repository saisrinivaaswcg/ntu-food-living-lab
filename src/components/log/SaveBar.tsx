import { Check } from 'lucide-react'

interface Props {
  label: string
  /** Short names of what's still missing, in on-screen order. */
  missing: string[]
  /** Storage failure from addLog. */
  error: string | null
}

/** Full-width Save button stuck to the bottom of the screen (above the mobile tab bar), within thumb reach. */
const MAX_LISTED = 3

export default function SaveBar({ label, missing, error }: Props) {
  // Keep the hint to one line on a phone: "site, bed, crop + 4 more"
  const missingText =
    missing.length > MAX_LISTED
      ? `${missing.slice(0, MAX_LISTED).join(', ')} + ${missing.length - MAX_LISTED} more`
      : missing.join(', ')

  return (
    <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 -mx-4 mt-2 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:bottom-4 lg:mx-0 lg:rounded-card lg:border lg:shadow-card">
      {error && (
        <p role="alert" className="mb-2 rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="flex min-h-14 w-full flex-col items-center justify-center rounded-xl bg-brand-700 px-4 py-1.5 font-semibold text-white transition-colors hover:bg-brand-800"
      >
        <span className="flex items-center gap-2">
          {missing.length === 0 && <Check className="size-5" aria-hidden />}
          {label}
        </span>
        {missing.length > 0 && (
          <span className="text-xs font-normal text-brand-50">Still needed: {missingText}</span>
        )}
      </button>
    </div>
  )
}
