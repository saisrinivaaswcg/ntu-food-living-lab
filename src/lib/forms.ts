/** Shared helpers for the four log forms. */

/** One thing that stops a form from saving. Issues are listed in on-screen order. */
export interface FieldIssue {
  /** id of the element to focus (and the base for its error message id) */
  id: string
  /** Short name for the "Still needed" line on the Save button, e.g. "photo" */
  short: string
  /** Full inline message shown under the field */
  message: string
}

export function issueMessage(issues: FieldIssue[], id: string, show: boolean): string | undefined {
  return show ? issues.find((i) => i.id === id)?.message : undefined
}

/** Move focus to the first problem so the user lands on what's missing (no blocking alerts). */
export function focusFirstIssue(issues: FieldIssue[]): void {
  const first = issues[0]
  if (!first) return
  // Wait a frame so fields that only render when invalid (e.g. the date input) exist.
  requestAnimationFrame(() => {
    const el = document.getElementById(first.id)
    el?.focus()
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  })
}

/** aria-describedby value for a field's hint and error. */
export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint && !error ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
}

/**
 * Parses what a person typed into a number field. Accepts "1.5", "1,5" and ".5".
 * Returns null for empty or non-numeric input.
 */
export function parseDecimal(raw: string): number | null {
  const text = raw.trim().replace(',', '.')
  if (!/^(\d+\.?\d*|\.\d+)$/.test(text)) return null
  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

/** Formats a number for an input: at most `decimals` places, no trailing zeros. */
export function formatDecimal(n: number, decimals: number): string {
  return String(Number(n.toFixed(decimals)))
}

/** Shared look for text inputs, selects and textareas. 16px text so iOS doesn't zoom. */
export const inputClass =
  'block min-h-12 w-full rounded-sm border border-line-strong bg-surface px-3 text-base text-ink focus:border-brand-700 focus:outline-2 focus:outline-offset-0 focus:outline-focus aria-[invalid=true]:border-danger disabled:border-line disabled:bg-sunken disabled:text-ink-subtle'
