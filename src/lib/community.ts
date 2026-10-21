/** Helpers for site communities: workdays, roles and joining. */
import { WEEKDAY_NAMES } from '../data'
import type { CommunityRole, ISODate, JoinRequest, SiteCommunity, SiteId, Workday } from '../types'
import { addDays, todayISO } from './dates'

/** "Saturday, 09:00 to 10:30" */
export function formatWorkday(w: Workday): string {
  return `${WEEKDAY_NAMES[w.weekday] ?? ''}, ${w.start} to ${w.end}`
}

/** The date of the next session for a workday, today included. */
export function nextDateFor(w: Workday, from: ISODate = todayISO()): ISODate {
  const day = new Date(`${from}T12:00:00`).getDay()
  return addDays(from, (w.weekday - day + 7) % 7)
}

/** The site's next workday session (soonest first), or null when it has none. */
export function nextWorkday(c: SiteCommunity | undefined, from: ISODate = todayISO()): { workday: Workday; date: ISODate } | null {
  if (!c || c.workdays.length === 0) return null
  return c.workdays
    .map((workday) => ({ workday, date: nextDateFor(workday, from) }))
    .sort((a, b) => `${a.date}${a.workday.start}`.localeCompare(`${b.date}${b.workday.start}`))[0]
}

export const ANY_ROLE: CommunityRole = { id: 'any', title: 'Anything that helps', detail: 'Not sure yet? The committee will suggest something.' }

export function roleTitle(c: SiteCommunity | undefined, roleId: string): string {
  if (roleId === ANY_ROLE.id) return ANY_ROLE.title
  return c?.roles.find((r) => r.id === roleId)?.title ?? 'A role that has since closed'
}

/** Join requests for one site, newest first. */
export function joinsForSite(joins: JoinRequest[], siteId: SiteId): JoinRequest[] {
  return joins.filter((j) => j.siteId === siteId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** A fresh role id from its title, unique within the site. */
export function roleIdFor(title: string, taken: string[]): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'role'
  let id = base
  for (let i = 2; taken.includes(id); i++) id = `${base}-${i}`
  return id
}

/** A site's community profile; sites without one (e.g. newly approved) get an empty profile to fill in. */
export function communityFor(communities: Record<SiteId, SiteCommunity>, siteId: SiteId): SiteCommunity {
  return (
    communities[siteId] ?? {
      siteId,
      welcome: '',
      workdays: [],
      meetingPoint: '',
      roles: [],
      pickPolicy: 'ask-first',
    }
  )
}
