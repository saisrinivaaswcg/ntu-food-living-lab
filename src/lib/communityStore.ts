/**
 * Community store: everything a visitor does that isn't a log, kept in this browser's localStorage under
 * its own key: the demo role, the student profile, committee PINs changed at handover, join requests
 * (Interest inbox), each site's community profile as its committee edited it, and help-wanted tasks and
 * the slots claimed on them.
 *
 * Same pattern as the log store: demo data is never written to storage; what was done on this device is
 * merged over it into a snapshot. Read once, write through, notify subscribers, and follow other tabs
 * via the "storage" event. useCommunity() reads it. Nothing here is secure; it is a demo login.
 */
import { DEMO_COMMITTEE_PIN, DEMO_STUDENT, defaultSpotlights, demoClaims, demoCommunities, demoJoins, demoTasks } from '../data'
import type { DemoRole, HelpTask, JoinRequest, JoinStatus, SiteCommunity, SiteId, SpotlightId, StudentProfile, TaskClaim } from '../types'

const STORAGE_KEY = 'ntu-food-living-lab:community:v1'

interface StoredCommunity {
  version: 1
  role: DemoRole
  /** The student profile on this device; null until someone joins a community or picks the demo student */
  profile: StudentProfile | null
  /** Committee PINs handed over on this device, by site. Sites not listed use the demo PIN. */
  pins: Record<SiteId, string>
  /** Join requests made on this device */
  joins: JoinRequest[]
  /** Inbox status changes, for demo and device joins alike */
  joinStatus: Record<string, JoinStatus>
  /** Community profiles as edited by a committee on this device (replace the demo profile) */
  communities: Record<SiteId, SiteCommunity>
  /** Help-wanted tasks posted on this device */
  tasks: HelpTask[]
  /** Demo or device tasks a committee took down on this device */
  removedTaskIds: string[]
  /** Slots claimed on this device */
  claims: TaskClaim[]
  /** Hall Cup spotlight challenges Admin chose on this device, by month "YYYY-MM" */
  spotlights: Record<string, SpotlightId>
}

export interface CommunitySnapshot {
  role: DemoRole
  profile: StudentProfile | null
  pins: Record<SiteId, string>
  /** Every join request: demo ones plus this device's, with inbox status applied */
  joins: JoinRequest[]
  /** Join requests made on this device (My gardens) */
  myJoins: JoinRequest[]
  /** Community profile by site (edited or demo) */
  communities: Record<SiteId, SiteCommunity>
  /** Sites whose community profile was edited on this device */
  editedCommunityIds: SiteId[]
  /** Every help-wanted task still up: demo ones plus this device's */
  tasks: HelpTask[]
  /** Every claimed slot on those tasks */
  claims: TaskClaim[]
  /** Slots claimed on this device (My gardens) */
  myClaims: TaskClaim[]
  /** Spotlight challenge by month "YYYY-MM": demo choices with Admin's changes */
  spotlights: Record<string, SpotlightId>
}

export type CommunitySaveResult = { ok: true } | { ok: false; error: string }

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const listOf = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v.filter(isObject) as T[]) : [])
const recordOf = <T,>(v: unknown): Record<string, T> => (isObject(v) ? (v as Record<string, T>) : {})

const fallback = (): StoredCommunity => ({
  version: 1,
  role: { kind: 'visitor' },
  profile: null,
  pins: {},
  joins: [],
  joinStatus: {},
  communities: {},
  tasks: [],
  removedTaskIds: [],
  claims: [],
  spotlights: {},
})

function parseRole(v: unknown): DemoRole {
  if (!isObject(v)) return { kind: 'visitor' }
  switch (v.kind) {
    case 'student':
      return { kind: 'student' }
    case 'admin':
      return { kind: 'admin' }
    case 'committee':
      return typeof v.siteId === 'string' ? { kind: 'committee', siteId: v.siteId } : { kind: 'visitor' }
    default:
      return { kind: 'visitor' }
  }
}

function parseProfile(v: unknown): StudentProfile | null {
  if (!isObject(v) || typeof v.name !== 'string' || typeof v.hall !== 'string') return null
  return {
    name: v.name,
    hall: v.hall,
    contactMethod: v.contactMethod === 'email' || v.contactMethod === 'phone' ? v.contactMethod : 'telegram',
    contact: typeof v.contact === 'string' ? v.contact : '',
    consent: v.consent === true,
    createdAt: typeof v.createdAt === 'string' ? v.createdAt : new Date().toISOString(),
    source: v.source === 'demo' ? 'demo' : 'user',
  }
}

function readStorage(): StoredCommunity {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback()
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const pins = Object.fromEntries(Object.entries(recordOf<unknown>(parsed.pins)).filter((e): e is [string, string] => typeof e[1] === 'string'))
    return {
      version: 1,
      role: parseRole(parsed.role),
      profile: parseProfile(parsed.profile),
      pins,
      joins: listOf<JoinRequest>(parsed.joins),
      joinStatus: recordOf<JoinStatus>(parsed.joinStatus),
      communities: recordOf<SiteCommunity>(parsed.communities),
      tasks: listOf<HelpTask>(parsed.tasks),
      removedTaskIds: Array.isArray(parsed.removedTaskIds) ? parsed.removedTaskIds.filter((v): v is string => typeof v === 'string') : [],
      claims: listOf<TaskClaim>(parsed.claims),
      spotlights: recordOf<SpotlightId>(parsed.spotlights),
    }
  } catch {
    // Private mode, blocked storage or corrupted JSON: start as a visitor rather than crash.
    return fallback()
  }
}

function writeStorage(next: StoredCommunity): CommunitySaveResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return { ok: true }
  } catch (err) {
    const quota = err instanceof DOMException && err.name === 'QuotaExceededError'
    return {
      ok: false,
      error: quota
        ? 'This device is out of storage. Delete some photos from your logs and try again.'
        : 'Could not save on this device. Check that the browser allows site storage.',
    }
  }
}

function buildSnapshot(s: StoredCommunity): CommunitySnapshot {
  const withStatus = (j: JoinRequest): JoinRequest => (s.joinStatus[j.id] ? { ...j, status: s.joinStatus[j.id] } : j)
  const myJoins = s.joins.map(withStatus)
  const communities: Record<SiteId, SiteCommunity> = Object.fromEntries(demoCommunities.map((c) => [c.siteId, c]))
  Object.assign(communities, s.communities)
  const removed = new Set(s.removedTaskIds)
  const tasks = [...demoTasks, ...s.tasks].filter((t) => !removed.has(t.id))
  const live = new Set(tasks.map((t) => t.id))
  return {
    role: s.role,
    profile: s.profile,
    pins: s.pins,
    joins: [...demoJoins.map(withStatus), ...myJoins],
    myJoins,
    communities,
    editedCommunityIds: Object.keys(s.communities),
    tasks,
    claims: [...demoClaims, ...s.claims].filter((c) => live.has(c.taskId)),
    myClaims: s.claims.filter((c) => live.has(c.taskId)),
    spotlights: { ...defaultSpotlights, ...s.spotlights },
  }
}

let state: StoredCommunity = readStorage()
let snapshot: CommunitySnapshot = buildSnapshot(state)
const listeners = new Set<() => void>()

/**
 * Saves and notifies. If storage is blocked the change still applies for this visit (so switching roles
 * works in a private window); the result says it wasn't saved.
 */
function commit(next: StoredCommunity): CommunitySaveResult {
  const result = writeStorage(next)
  state = next
  snapshot = buildSnapshot(state)
  listeners.forEach((l) => l())
  return result
}

export function subscribeCommunity(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getCommunitySnapshot(): CommunitySnapshot {
  return snapshot
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY && e.key !== null) return
    state = readStorage()
    snapshot = buildSnapshot(state)
    listeners.forEach((l) => l())
  })
}

/** crypto.randomUUID only exists on https/localhost; phones on the LAN use plain http. */
function newId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}

/* ------------------------------------------------------------------ */
/* Roles and profile                                                   */
/* ------------------------------------------------------------------ */

/** Switch the demo role. Choosing Student without a profile uses the ready-made demo student. */
export function setRole(role: DemoRole): CommunitySaveResult {
  const profile = role.kind === 'student' && !state.profile ? { ...DEMO_STUDENT } : state.profile
  return commit({ ...state, role, profile })
}

/** Creates or updates the student profile and switches to the Student role. */
export function saveProfile(profile: StudentProfile): CommunitySaveResult {
  return commit({ ...state, profile, role: { kind: 'student' } })
}

/** Deletes the profile and everything it joined from this device, and goes back to Visitor. */
export function deleteProfile(): CommunitySaveResult {
  return commit({
    ...state,
    profile: null,
    joins: [],
    claims: [],
    role: state.role.kind === 'student' ? { kind: 'visitor' } : state.role,
  })
}

export function committeePin(siteId: SiteId): string {
  return state.pins[siteId] ?? DEMO_COMMITTEE_PIN
}

export function setCommitteePin(siteId: SiteId, pin: string): CommunitySaveResult {
  return commit({ ...state, pins: { ...state.pins, [siteId]: pin } })
}

/* ------------------------------------------------------------------ */
/* Joining a community                                                 */
/* ------------------------------------------------------------------ */

export type NewJoin = Omit<JoinRequest, 'id' | 'status' | 'createdAt' | 'source'>

/**
 * Asks to join a site's community: saves (or updates) the student profile from the same details, and
 * puts the request in the site's Interest inbox. Joining the same site again replaces the earlier ask.
 */
export function joinCommunity(input: NewJoin): CommunitySaveResult {
  const join: JoinRequest = { ...input, id: newId('join'), status: 'new', createdAt: new Date().toISOString(), source: 'user' }
  const profile: StudentProfile = {
    name: input.name,
    hall: input.hall,
    contactMethod: input.contactMethod,
    contact: input.contact,
    consent: input.consent,
    createdAt: state.profile?.source === 'user' ? state.profile.createdAt : join.createdAt,
    source: 'user',
  }
  return commit({
    ...state,
    profile,
    role: { kind: 'student' },
    joins: [...state.joins.filter((j) => j.siteId !== input.siteId), join],
  })
}

/** Leaves a community joined on this device (the request leaves the site's inbox too). */
export function leaveCommunity(joinId: string): CommunitySaveResult {
  return commit({ ...state, joins: state.joins.filter((j) => j.id !== joinId) })
}

/** Committee: move a request along the inbox (new → contacted → welcomed). */
export function setJoinStatus(joinId: string, status: JoinStatus): CommunitySaveResult {
  return commit({ ...state, joinStatus: { ...state.joinStatus, [joinId]: status } })
}

/** Committee: save the site's community profile (workdays, open roles, meeting point, pick policy). */
export function saveCommunity(community: SiteCommunity): CommunitySaveResult {
  return commit({ ...state, communities: { ...state.communities, [community.siteId]: community } })
}

/** Back to the demo community profile for a site. */
export function resetCommunityProfile(siteId: SiteId): CommunitySaveResult {
  const communities = { ...state.communities }
  delete communities[siteId]
  return commit({ ...state, communities })
}

/* ------------------------------------------------------------------ */
/* Help wanted                                                         */
/* ------------------------------------------------------------------ */

export type NewTask = Omit<HelpTask, 'id' | 'source' | 'createdAt'>

/** Committee: post a task that needs helpers. */
export function postTask(input: NewTask): CommunitySaveResult {
  const task: HelpTask = { ...input, id: newId('task'), source: 'user', createdAt: new Date().toISOString() }
  return commit({ ...state, tasks: [...state.tasks, task] })
}

/** Committee: take a task down (its claims go with it). Returns an undo. */
export function removeTask(taskId: string): () => void {
  const before = state
  commit({ ...state, removedTaskIds: [...state.removedTaskIds, taskId] })
  return () => commit({ ...state, removedTaskIds: before.removedTaskIds, tasks: before.tasks })
}

/** Claim one slot on a task. Refuses when the task is full or this name already has a slot. */
export function claimTask(taskId: string, name: string, hall?: string): CommunitySaveResult {
  const snap = buildSnapshot(state)
  const task = snap.tasks.find((t) => t.id === taskId)
  if (!task) return { ok: false, error: 'That task has been taken down.' }
  const taken = snap.claims.filter((c) => c.taskId === taskId)
  if (taken.length >= task.helpersNeeded) return { ok: false, error: 'Every slot on this task is taken.' }
  if (taken.some((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase())) {
    return { ok: false, error: `${name} already has a slot on this task.` }
  }
  const claim: TaskClaim = { id: newId('claim'), taskId, name: name.trim(), hall, claimedAt: new Date().toISOString(), source: 'user' }
  return commit({ ...state, claims: [...state.claims, claim] })
}

/** Give a slot back (claims made on this device). */
export function unclaimTask(claimId: string): CommunitySaveResult {
  return commit({ ...state, claims: state.claims.filter((c) => c.id !== claimId) })
}

/* ------------------------------------------------------------------ */
/* Hall Garden Cup                                                     */
/* ------------------------------------------------------------------ */

/** Admin: choose a month's spotlight challenge (from the fixed list). */
export function setSpotlight(month: string, challenge: SpotlightId): CommunitySaveResult {
  return commit({ ...state, spotlights: { ...state.spotlights, [month]: challenge } })
}

/**
 * Back to the demo state: used by Admin's "Reset demo data" (which keeps the admin role) and showcase
 * mode (which goes back to Visitor).
 */
export function resetCommunity(keepRole?: DemoRole): void {
  commit({ ...fallback(), role: keepRole ?? { kind: 'visitor' } })
}
