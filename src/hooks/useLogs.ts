import { useSyncExternalStore } from 'react'
import { getSnapshot, subscribe, type LogSnapshot } from '../lib/logStore'

/** Live view of all logs (demo + this device's submissions). Re-renders on every new log. */
export function useLogs(): LogSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
