/**
 * Log store: merges the read-only demo logs with what was done on this device, all in localStorage:
 * - the user's own submissions (editable and deletable),
 * - edits and deletions of demo records (overrides; the demo data itself is never changed),
 * - each site's beds and plants as set up by hand (Beds & plants on a site page).
 *
 * Forms call addLog(); everything reads getSnapshot() through the useLogs() hook. Because every
 * reader subscribes to this store, any change shows up on every page immediately — and in other
 * open tabs via the "storage" event.
 */
import { demoLogs, sites as baseSites } from '../data'
import type { Bed, LogCollections, LogKind, PlantingLog, Site, SiteId, SiteSetup } from '../types'
import { latestLogDate } from './metrics'
import { getCommunitySnapshot, subscribeCommunity } from './communityStore'
import { setSites } from './siteRegistry'
import { todayISO } from './dates'

const STORAGE_KEY = 'ntu-food-living-lab:v1'

type AnyRecord = LogCollections[LogKind][number]

interface StoredState {
  version: 1
  /** Only the user's own submissions — demo data is never written to storage. */
  userLogs: LogCollections
  showDemoData: boolean
  /** Field changes to demo records, by record id */
  demoEdits: Record<string, Partial<AnyRecord>>
  /** Demo record ids deleted on this device */
  demoDeleted: string[]
  /** Beds and plants set up by hand, by site */
  siteSetup: Partial<Record<SiteId, SiteSetup>>
}

export interface LogSnapshot {
  /** What the app should display: user logs, plus demo logs (with edits) when showDemoData is on. */
  logs: LogCollections
  userLogs: LogCollections
  showDemoData: boolean
  userLogCount: number
  /** The sites as currently set up (demo sites with any edited beds). */
  sites: Site[]
  siteSetup: Partial<Record<SiteId, SiteSetup>>
  /** How many demo records were edited or deleted on this device */
  demoChangeCount: number
}

/** A record as the form provides it — the store adds id, source and createdAt. */
export type NewLog<K extends LogKind> = Omit<LogCollections[K][number], 'id' | 'source' | 'createdAt'>

export type SaveResult = { ok: true; id: string } | { ok: false; error: string }

const emptyLogs = (): LogCollections => ({ plantings: [], harvests: [], weeklyInputs: [], failures: [] })
const KINDS: LogKind[] = ['plantings', 'harvests', 'weeklyInputs', 'failures']

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function readStorage(): StoredState {
  const fallback: StoredState = {
    version: 1,
    userLogs: emptyLogs(),
    showDemoData: true,
    demoEdits: {},
    demoDeleted: [],
    siteSetup: {},
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<StoredState>
    const logs = emptyLogs()
    for (const kind of KINDS) {
      const value = parsed.userLogs?.[kind]
      if (Array.isArray(value)) (logs[kind] as unknown[]) = value
    }
    return {
      version: 1,
      userLogs: logs,
      showDemoData: parsed.showDemoData ?? true,
      demoEdits: isObject(parsed.demoEdits) ? (parsed.demoEdits as StoredState['demoEdits']) : {},
      demoDeleted: Array.isArray(parsed.demoDeleted) ? parsed.demoDeleted.filter((x) => typeof x === 'string') : [],
      siteSetup: isObject(parsed.siteSetup) ? (parsed.siteSetup as StoredState['siteSetup']) : {},
    }
  } catch {
    // Private mode, blocked storage or corrupted JSON: start clean rather than crash.
    return fallback
  }
}

function writeStorage(next: StoredState): SaveResult | null {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return null
  } catch (err) {
    const quota = err instanceof DOMException && err.name === 'QuotaExceededError'
    return {
      ok: false,
      error: quota
        ? 'This device is out of storage for logs. Try a smaller photo, or export and clear old logs.'
        : 'Could not save on this device. Check that the browser allows site storage.',
    }
  }
}

/* ------------------------------------------------------------------ */
/* Effective sites and logs                                            */
/* ------------------------------------------------------------------ */

/** Demo beds have no area of their own: the site's area is shared equally between them. */
function withBedAreas(site: Site): Site {
  const share = site.beds.length ? Math.round((site.areaSqm / site.beds.length) * 10) / 10 : 0
  return { ...site, beds: site.beds.map((b): Bed => ({ ...b, areaSqm: b.areaSqm ?? share })) }
}

function applySetup(site: Site, setup: SiteSetup | undefined): Site {
  if (!setup) return withBedAreas(site)
  const beds = setup.beds.map((b): Bed => ({ id: b.id, label: b.label, areaSqm: b.areaSqm }))
  const area = Math.round(beds.reduce((n, b) => n + (b.areaSqm ?? 0), 0) * 10) / 10
  return { ...site, beds, areaSqm: area }
}

/**
 * A bed whose crop or plant count was set by hand becomes a 'setup' planting dated at the latest log,
 * so "what's growing now", plants in the ground and survival all follow the setup.
 */
function setupPlantings(setup: StoredState['siteSetup'], asOf: string): PlantingLog[] {
  return (Object.entries(setup) as [SiteId, SiteSetup][]).flatMap(([siteId, s]) =>
    s.beds.flatMap((b): PlantingLog[] =>
      b.planting
        ? [
            {
              id: `setup-${b.id}`,
              siteId,
              bedId: b.id,
              // A bed set to "nothing growing" is a zero-plant record, which reads as empty.
              cropId: b.planting.cropId ?? 'basil',
              quantity: b.planting.cropId ? b.planting.plants : 0,
              date: asOf,
              propagation: 'seedling',
              source: 'setup',
              createdAt: s.savedAt,
              editedAt: s.savedAt,
            },
          ]
        : [],
    ),
  )
}

/* ------------------------------------------------------------------ */
/* Snapshot + subscriptions                                            */
/* ------------------------------------------------------------------ */

let state: StoredState = readStorage()
let snapshot: LogSnapshot = buildSnapshot(state)
const listeners = new Set<() => void>()

function buildSnapshot(s: StoredState): LogSnapshot {
  const deleted = new Set(s.demoDeleted)
  const demo = <K extends LogKind>(kind: K) =>
    (demoLogs[kind] as AnyRecord[])
      .filter((r) => !deleted.has(r.id))
      .map((r) => (s.demoEdits[r.id] ? { ...r, ...s.demoEdits[r.id] } : r)) as LogCollections[K]
  const merge = <K extends LogKind>(kind: K) =>
    (s.showDemoData ? [...demo(kind), ...s.userLogs[kind]] : [...s.userLogs[kind]]) as LogCollections[K]

  const logs: LogCollections = {
    plantings: merge('plantings'),
    harvests: merge('harvests'),
    weeklyInputs: merge('weeklyInputs'),
    failures: merge('failures'),
  }
  const asOf = latestLogDate(logs) ?? todayISO()
  logs.plantings = [...logs.plantings, ...setupPlantings(s.siteSetup, asOf)]

  // Demo sites plus hall sites Admin approved on this device (kept in the community store).
  const sites = [...baseSites, ...getCommunitySnapshot().approvedSites].map((site) => applySetup(site, s.siteSetup[site.id]))
  // Lookups and metrics read the registry; update it before anyone re-renders.
  setSites(sites)

  return {
    logs,
    userLogs: s.userLogs,
    showDemoData: s.showDemoData,
    userLogCount: Object.values(s.userLogs).reduce((n, list) => n + list.length, 0),
    sites,
    siteSetup: s.siteSetup,
    demoChangeCount: Object.keys(s.demoEdits).length + s.demoDeleted.length,
  }
}

/** Approving a hall site changes the site list: rebuild when the approved sites change (not on every role switch). */
let approvedKey = JSON.stringify(getCommunitySnapshot().approvedSites)
subscribeCommunity(() => {
  const key = JSON.stringify(getCommunitySnapshot().approvedSites)
  if (key === approvedKey) return
  approvedKey = key
  snapshot = buildSnapshot(state)
  listeners.forEach((l) => l())
})

function commit(next: StoredState): SaveResult | null {
  const failure = writeStorage(next)
  if (failure) return failure
  state = next
  snapshot = buildSnapshot(state)
  listeners.forEach((l) => l())
  return null
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): LogSnapshot {
  return snapshot
}

// Keep tabs in sync: a harvest logged in one tab updates a dashboard open in another.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return
    state = readStorage()
    snapshot = buildSnapshot(state)
    listeners.forEach((l) => l())
  })
}

/* ------------------------------------------------------------------ */
/* Mutations: new records                                              */
/* ------------------------------------------------------------------ */

/** crypto.randomUUID only exists on https/localhost; phones on the LAN use plain http. */
function newId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}

const ID_PREFIX: Record<LogKind, string> = {
  plantings: 'p',
  harvests: 'h',
  weeklyInputs: 'w',
  failures: 'f',
}

export function addLog<K extends LogKind>(kind: K, input: NewLog<K>): SaveResult {
  const id = newId(ID_PREFIX[kind])
  const record = { ...input, id, source: 'user', createdAt: new Date().toISOString() } as LogCollections[K][number]
  const userLogs = { ...state.userLogs, [kind]: [...state.userLogs[kind], record] }
  const failure = commit({ ...state, userLogs })
  return failure ?? { ok: true, id }
}

/** Removes one of the user's own records (used for "Undo" after submitting). */
export function removeUserLog(kind: LogKind, id: string): void {
  const list = state.userLogs[kind] as { id: string }[]
  const userLogs = { ...state.userLogs, [kind]: list.filter((r) => r.id !== id) }
  commit({ ...state, userLogs })
}

/**
 * Replaces some of the user's records with a new one in a single write, so a failed
 * save (e.g. storage full) never loses the old records. Used for "one weekly record per site-week".
 */
export function replaceUserLogs<K extends LogKind>(kind: K, oldIds: string[], input: NewLog<K>): SaveResult {
  const id = newId(ID_PREFIX[kind])
  const record = { ...input, id, source: 'user', createdAt: new Date().toISOString() } as LogCollections[K][number]
  const kept = (state.userLogs[kind] as { id: string }[]).filter((r) => !oldIds.includes(r.id))
  const userLogs = { ...state.userLogs, [kind]: [...kept, record] }
  const failure = commit({ ...state, userLogs })
  return failure ?? { ok: true, id }
}

/** Undo for replaceUserLogs: removes the new record and puts the previous ones back unchanged. */
export function undoReplaceUserLogs<K extends LogKind>(kind: K, newId: string, previous: LogCollections[K]): void {
  const kept = (state.userLogs[kind] as { id: string }[]).filter((r) => r.id !== newId)
  const userLogs = { ...state.userLogs, [kind]: [...kept, ...previous] }
  commit({ ...state, userLogs })
}

/* ------------------------------------------------------------------ */
/* Mutations: editing and deleting any record                          */
/* ------------------------------------------------------------------ */

const isUserRecord = (kind: LogKind, id: string) => (state.userLogs[kind] as { id: string }[]).some((r) => r.id === id)

/**
 * Changes fields of any record. User records change in place; demo records get an override.
 * On success, `undo` puts the record back exactly as it was (including no "Edited" marker).
 */
export function updateLog<K extends LogKind>(
  kind: K,
  id: string,
  patch: Partial<NewLog<K>>,
): { ok: true; undo: () => void } | { ok: false; error: string } {
  const editedAt = new Date().toISOString()
  if (isUserRecord(kind, id)) {
    const previous = (state.userLogs[kind] as AnyRecord[]).find((r) => r.id === id)
    const list = (state.userLogs[kind] as AnyRecord[]).map((r) => (r.id === id ? { ...r, ...patch, editedAt } : r))
    const failure = commit({ ...state, userLogs: { ...state.userLogs, [kind]: list } })
    if (failure && !failure.ok) return failure
    return {
      ok: true,
      undo: () => {
        const restored = (state.userLogs[kind] as AnyRecord[]).map((r) => (r.id === id && previous ? previous : r))
        commit({ ...state, userLogs: { ...state.userLogs, [kind]: restored } })
      },
    }
  }
  const previousEdit = state.demoEdits[id]
  const demoEdits = { ...state.demoEdits, [id]: { ...previousEdit, ...patch, editedAt } as Partial<AnyRecord> }
  const failure = commit({ ...state, demoEdits })
  if (failure && !failure.ok) return failure
  return {
    ok: true,
    undo: () => {
      const restored = { ...state.demoEdits }
      if (previousEdit) restored[id] = previousEdit
      else delete restored[id]
      commit({ ...state, demoEdits: restored })
    },
  }
}

/** Deletes any record. Returns an undo that puts it back exactly as it was. */
export function deleteLog(kind: LogKind, id: string): () => void {
  const before = state
  if (isUserRecord(kind, id)) {
    const list = (state.userLogs[kind] as AnyRecord[]).filter((r) => r.id !== id)
    commit({ ...state, userLogs: { ...state.userLogs, [kind]: list } })
  } else {
    commit({ ...state, demoDeleted: [...state.demoDeleted, id] })
  }
  return () => {
    // Restore only this record; keep anything else changed since.
    if (before.userLogs[kind].some((r) => r.id === id)) {
      const record = before.userLogs[kind].find((r) => r.id === id)
      if (record) commit({ ...state, userLogs: { ...state.userLogs, [kind]: [...state.userLogs[kind], record] } })
    } else {
      commit({ ...state, demoDeleted: state.demoDeleted.filter((d) => d !== id) })
    }
  }
}

/** Puts one demo record back to its original values (and undeletes it). */
export function resetDemoRecord(id: string): void {
  const demoEdits = { ...state.demoEdits }
  delete demoEdits[id]
  commit({ ...state, demoEdits, demoDeleted: state.demoDeleted.filter((d) => d !== id) })
}

/** Puts every demo record back to its original values. */
export function resetAllDemoChanges(): void {
  commit({ ...state, demoEdits: {}, demoDeleted: [] })
}


/* ------------------------------------------------------------------ */
/* Mutations: site setup (Beds & plants)                               */
/* ------------------------------------------------------------------ */

export function saveSiteSetup(siteId: SiteId, setup: SiteSetup): SaveResult {
  const failure = commit({ ...state, siteSetup: { ...state.siteSetup, [siteId]: setup } })
  return failure ?? { ok: true, id: siteId }
}

/** Back to the original beds, areas and plantings for this site. */
export function resetSiteSetup(siteId: SiteId): void {
  const siteSetup = { ...state.siteSetup }
  delete siteSetup[siteId]
  commit({ ...state, siteSetup })
}

/* ------------------------------------------------------------------ */
/* Preferences                                                         */
/* ------------------------------------------------------------------ */

export function setShowDemoData(show: boolean): void {
  commit({ ...state, showDemoData: show })
}

export function clearUserLogs(): void {
  commit({ ...state, userLogs: emptyLogs() })
}

/** Everything back to the demo data: no submissions, no edits, original beds, demo data shown. */
export function resetLogStore(): void {
  commit({ version: 1, userLogs: emptyLogs(), showDemoData: true, demoEdits: {}, demoDeleted: [], siteSetup: {} })
}
