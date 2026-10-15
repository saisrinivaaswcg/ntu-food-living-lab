/**
 * Log store: merges the read-only demo logs with submissions saved in localStorage.
 *
 * Forms call addLog(); the dashboard reads getSnapshot() through the useLogs() hook.
 * Because every reader subscribes to this store, a harvest logged on the Log page
 * shows up on the Dashboard immediately — and in other open tabs via the "storage" event.
 */
import { demoLogs } from '../data'
import type { LogCollections, LogKind } from '../types'

const STORAGE_KEY = 'ntu-food-living-lab:v1'

interface StoredState {
  version: 1
  /** Only the user's own submissions — demo data is never written to storage. */
  userLogs: LogCollections
  showDemoData: boolean
}

export interface LogSnapshot {
  /** What the app should display: user logs, plus demo logs when showDemoData is on. */
  logs: LogCollections
  userLogs: LogCollections
  showDemoData: boolean
  userLogCount: number
}

/** A record as the form provides it — the store adds id, source and createdAt. */
export type NewLog<K extends LogKind> = Omit<LogCollections[K][number], 'id' | 'source' | 'createdAt'>

export type SaveResult = { ok: true; id: string } | { ok: false; error: string }

const emptyLogs = (): LogCollections => ({ plantings: [], harvests: [], weeklyInputs: [], failures: [] })

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

function readStorage(): StoredState {
  const fallback: StoredState = { version: 1, userLogs: emptyLogs(), showDemoData: true }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<StoredState>
    const logs = emptyLogs()
    for (const kind of Object.keys(logs) as LogKind[]) {
      const value = parsed.userLogs?.[kind]
      if (Array.isArray(value)) (logs[kind] as unknown[]) = value
    }
    return { version: 1, userLogs: logs, showDemoData: parsed.showDemoData ?? true }
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
/* Snapshot + subscriptions                                            */
/* ------------------------------------------------------------------ */

let state: StoredState = readStorage()
let snapshot: LogSnapshot = buildSnapshot(state)
const listeners = new Set<() => void>()

function buildSnapshot(s: StoredState): LogSnapshot {
  const merge = <K extends LogKind>(kind: K) =>
    (s.showDemoData ? [...demoLogs[kind], ...s.userLogs[kind]] : [...s.userLogs[kind]]) as LogCollections[K]

  return {
    logs: {
      plantings: merge('plantings'),
      harvests: merge('harvests'),
      weeklyInputs: merge('weeklyInputs'),
      failures: merge('failures'),
    },
    userLogs: s.userLogs,
    showDemoData: s.showDemoData,
    userLogCount: Object.values(s.userLogs).reduce((n, list) => n + list.length, 0),
  }
}

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
/* Mutations                                                           */
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

/** Removes one of the user's own records (used for "Undo" after submitting). Demo records can't be removed. */
export function removeUserLog(kind: LogKind, id: string): void {
  const list = state.userLogs[kind] as { id: string }[]
  const userLogs = { ...state.userLogs, [kind]: list.filter((r) => r.id !== id) }
  commit({ ...state, userLogs })
}

export function setShowDemoData(show: boolean): void {
  commit({ ...state, showDemoData: show })
}

export function clearUserLogs(): void {
  commit({ ...state, userLogs: emptyLogs() })
}
