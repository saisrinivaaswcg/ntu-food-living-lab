/**
 * The crop vocabulary as it stands on this device: the crops in src/data plus any a committee added in
 * Manage site. The community store keeps it up to date before it notifies readers, so lookups, metrics
 * and forms always see added crops. Components read it through useCrops().
 */
import { crops as baseCrops } from '../data'
import type { Crop, CropId } from '../types'

let current: Crop[] = baseCrops
let byId = new Map(current.map((c) => [c.id, c]))
let order = new Map(current.map((c, i) => [c.id, i]))

export function getCrops(): Crop[] {
  return current
}

export function getCropById(id: CropId): Crop | undefined {
  return byId.get(id)
}

/** Position in the list, for sorting crops in a stable order. */
export function cropIndex(id: CropId): number {
  return order.get(id) ?? Number.MAX_SAFE_INTEGER
}

/** Called by the community store only. */
export function setCrops(next: Crop[]): void {
  current = next
  byId = new Map(next.map((c) => [c.id, c]))
  order = new Map(next.map((c, i) => [c.id, i]))
}
