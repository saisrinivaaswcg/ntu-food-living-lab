/** Handover checklist ticks, saved on this device per handover record. */
import type { ChecklistItem } from '../types'

const KEY_PREFIX = 'ntu-food-living-lab:handover-checklist:'

/** Item id → ticked. Items missing from storage fall back to the record's own `done`. */
export type ChecklistTicks = Record<string, boolean>

export function loadTicks(handoverId: string, items: ChecklistItem[]): ChecklistTicks {
  const ticks: ChecklistTicks = Object.fromEntries(items.map((i) => [i.id, i.done]))
  try {
    const raw = localStorage.getItem(KEY_PREFIX + handoverId)
    const stored: unknown = raw ? JSON.parse(raw) : null
    if (stored && typeof stored === 'object') {
      for (const item of items) {
        const value = (stored as Record<string, unknown>)[item.id]
        if (typeof value === 'boolean') ticks[item.id] = value
      }
    }
  } catch {
    // Storage blocked or corrupt: show the record's own ticks.
  }
  return ticks
}

export function saveTicks(handoverId: string, ticks: ChecklistTicks): void {
  try {
    localStorage.setItem(KEY_PREFIX + handoverId, JSON.stringify(ticks))
  } catch {
    // Storage blocked or full: ticks still work until the page is reloaded.
  }
}
