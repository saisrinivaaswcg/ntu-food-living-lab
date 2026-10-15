/** Validation rules shared by the log forms. Each returns an error message, or null when valid. */
import { todayISO } from './dates'

export function checkDate(value: string): string | null {
  if (!value) return 'Choose a date.'
  if (value > todayISO()) return "The date can't be in the future."
  return null
}

/** A required number between min and max (inclusive). */
export function checkNumber(
  value: number | null,
  { what, min, max, unit, allowZero = false, whole = false }: {
    what: string
    min?: number
    max: number
    unit: string
    allowZero?: boolean
    whole?: boolean
  },
): string | null {
  if (value === null) return `Enter the ${what}.`
  if (whole && !Number.isInteger(value)) return `Enter the ${what} as a whole number.`
  if (!allowZero && value <= 0) return `The ${what} must be more than 0.`
  if (min !== undefined && value < min) return `The ${what} must be at least ${min} ${unit}.`
  if (value > max) return `That's more than ${max} ${unit} — check the ${what}.`
  return null
}
