/** Helpers for help-wanted tasks: slots left, what's coming up and calendar files. */
import type { HelpTask, ISODate, TaskClaim } from '../types'
import { todayISO } from './dates'
import { siteName } from './lookups'

export function claimsFor(claims: TaskClaim[], taskId: string): TaskClaim[] {
  return claims.filter((c) => c.taskId === taskId)
}

export function spotsLeft(task: HelpTask, claims: TaskClaim[]): number {
  return Math.max(0, task.helpersNeeded - claimsFor(claims, task.id).length)
}

/** Tasks from today on, soonest first. */
export function upcomingTasks(tasks: HelpTask[], from: ISODate = todayISO()): HelpTask[] {
  return tasks.filter((t) => t.date >= from).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
}

/** "20261024T090000": a floating local time; the calendar adds Singapore's zone via TZID. */
const icsTime = (date: ISODate, time: string) => `${date.replaceAll('-', '')}T${time.replace(':', '')}00`

/** Escapes text for an iCalendar property value. */
const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')

/** An .ics calendar file for one task, for "Add to calendar". */
export function taskIcs(task: HelpTask, where: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NTU Food Living Lab//Help wanted//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${task.id}@ntu-food-living-lab`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Asia/Singapore:${icsTime(task.date, task.start)}`,
    `DTEND;TZID=Asia/Singapore:${icsTime(task.date, task.end)}`,
    `SUMMARY:${icsText(`${task.title} (${siteName(task.siteId, true)})`)}`,
    `DESCRIPTION:${icsText(task.detail)}`,
    `LOCATION:${icsText(where)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

/** Saves the task's calendar file through the browser's download. */
export function downloadTaskIcs(task: HelpTask, where: string): void {
  const blob = new Blob([taskIcs(task, where)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${task.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'task'}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
