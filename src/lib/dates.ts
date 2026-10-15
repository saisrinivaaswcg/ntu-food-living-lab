/**
 * Date helpers. Dates are ISO strings (YYYY-MM-DD) in local time; weeks start on Monday.
 */
import type { ISODate } from '../types'

const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Today on this device, in local time (not UTC — a 7am harvest in Singapore is still today). */
export function todayISO(): ISODate {
  return toISODate(new Date())
}

export function parseISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

/** Monday of the week containing `iso`. */
export function mondayOf(iso: ISODate): ISODate {
  const d = parseISODate(iso)
  return addDays(iso, -((d.getDay() + 6) % 7))
}

/** The Monday of this week and the `count - 1` weeks before it, newest first. */
export function recentMondays(count: number, from: ISODate = todayISO()): ISODate[] {
  const thisMonday = mondayOf(from)
  return Array.from({ length: count }, (_, i) => addDays(thisMonday, -7 * i))
}

/** e.g. "Thu 15 Oct 2026" */
export function formatDate(iso: ISODate): string {
  return parseISODate(iso).toLocaleDateString('en-SG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** e.g. "15 Oct" */
export function formatShortDate(iso: ISODate): string {
  return parseISODate(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
}
