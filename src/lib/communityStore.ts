/**
 * Community store: everything a visitor does that isn't a log, kept in this browser's localStorage under
 * its own key: the demo role, the student profile and committee PINs changed at handover.
 *
 * Same pattern as the log store: read once, write through, notify subscribers, and follow other tabs via
 * the "storage" event. useCommunity() reads it. Nothing here is secure; it is a demo login.
 */
import { DEMO_COMMITTEE_PIN, DEMO_STUDENT } from '../data'
import type { DemoRole, SiteId, StudentProfile } from '../types'

const STORAGE_KEY = 'ntu-food-living-lab:community:v1'

interface StoredCommunity {
  version: 1
  role: DemoRole
  /** The student profile on this device; null until someone joins a community or picks the demo student */
  profile: StudentProfile | null
  /** Committee PINs handed over on this device, by site. Sites not listed use the demo PIN. */
  pins: Record<SiteId, string>
}

export type CommunitySnapshot = Readonly<StoredCommunity>

export type CommunitySaveResult = { ok: true } | { ok: false; error: string }

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

const fallback = (): StoredCommunity => ({ version: 1, role: { kind: 'visitor' }, profile: null, pins: {} })

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
    const pins = isObject(parsed.pins)
      ? Object.fromEntries(Object.entries(parsed.pins).filter((e): e is [string, string] => typeof e[1] === 'string'))
      : {}
    return { version: 1, role: parseRole(parsed.role), profile: parseProfile(parsed.profile), pins }
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

let state: StoredCommunity = readStorage()
const listeners = new Set<() => void>()

/**
 * Saves and notifies. If storage is blocked the change still applies for this visit (so switching roles
 * works in a private window); the result says it wasn't saved.
 */
function commit(next: StoredCommunity): CommunitySaveResult {
  const result = writeStorage(next)
  state = next
  listeners.forEach((l) => l())
  return result
}

export function subscribeCommunity(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getCommunitySnapshot(): CommunitySnapshot {
  return state
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY && e.key !== null) return
    state = readStorage()
    listeners.forEach((l) => l())
  })
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

/** Deletes the profile from this device and goes back to Visitor. */
export function deleteProfile(): CommunitySaveResult {
  return commit({ ...state, profile: null, role: state.role.kind === 'student' ? { kind: 'visitor' } : state.role })
}

export function committeePin(siteId: SiteId): string {
  return state.pins[siteId] ?? DEMO_COMMITTEE_PIN
}

export function setCommitteePin(siteId: SiteId, pin: string): CommunitySaveResult {
  return commit({ ...state, pins: { ...state.pins, [siteId]: pin } })
}

/** Back to a fresh visitor: used by Admin's "Reset demo data" and showcase mode. */
export function resetCommunity(): void {
  commit(fallback())
}
