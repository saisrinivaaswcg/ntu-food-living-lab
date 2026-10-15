import type { FailureLog } from '../types'

/**
 * DEMONSTRATION DATA — generated for the prototype, not real measurements.
 * Replace this array with real records (same shape) when the platform goes live.
 */
export const demoFailures: FailureLog[] = [
  { id: "demo-f-001", siteId: "hall-12-herb-spice", bedId: "H12-B4", cropId: "lemongrass", date: "2026-07-28", cause: "drought", estimatedLossPlants: 3, description: "Three clumps dried out over the vacation week when the watering roster had gaps.", photo: { kind: 'demo-placeholder', caption: "Lemongrass damage, H12-B4 — demo photo" }, source: "demo", createdAt: "2026-07-28T19:41:00+08:00" },
  { id: "demo-f-002", siteId: "hall-12-herb-spice", bedId: "H12-B1", cropId: "basil", date: "2026-08-12", cause: "pest", estimatedLossPlants: 8, description: "Caterpillars stripped the top growth on eight plants in Planter box A.", photo: { kind: 'demo-placeholder', caption: "Thai basil damage, H12-B1 — demo photo" }, source: "demo", createdAt: "2026-08-12T19:48:00+08:00" },
  { id: "demo-f-003", siteId: "community-herb-garden", bedId: "CHG-T7", cropId: "basil", date: "2026-08-26", cause: "unknown", estimatedLossPlants: 6, description: "Six seedlings collapsed at the stem within two days. No visible pests.", photo: { kind: 'demo-placeholder', caption: "Thai basil damage, CHG-T7 — demo photo" }, source: "demo", createdAt: "2026-08-26T19:20:00+08:00" },
  { id: "demo-f-004", siteId: "earthlink-yunnan-corner", bedId: "EYC-B5", cropId: "mint", date: "2026-09-02", cause: "disease", estimatedLossPlants: 5, description: "Root rot in five grow bags. Coir mix stayed waterlogged after heavy rain.", photo: { kind: 'demo-placeholder', caption: "Mint damage, EYC-B5 — demo photo" }, source: "demo", createdAt: "2026-09-02T19:55:00+08:00" },
  { id: "demo-f-005", siteId: "community-herb-garden", bedId: "CHG-T5", cropId: "chilli-padi", date: "2026-09-09", cause: "pest", estimatedLossPlants: 3, description: "Leaf curl and bronzing from thrips on three plants; removed to protect the rest.", photo: { kind: 'demo-placeholder', caption: "Chilli padi damage, CHG-T5 — demo photo" }, source: "demo", createdAt: "2026-09-09T19:20:00+08:00" },
  { id: "demo-f-006", siteId: "earthlink-yunnan-corner", bedId: "EYC-B1", cropId: "kangkong", date: "2026-09-16", cause: "drought", estimatedLossPlants: 70, description: "Wicking reservoir ran dry during recess week. Most of the bed wilted beyond recovery.", photo: { kind: 'demo-placeholder', caption: "Kangkong damage, EYC-B1 — demo photo" }, source: "demo", createdAt: "2026-09-16T19:20:00+08:00" },
  { id: "demo-f-007", siteId: "yunnan-culinary-trail", bedId: "YCT-B5", cropId: "chilli-padi", date: "2026-10-07", cause: "disease", estimatedLossPlants: 2, description: "Sunken dark spots on fruit (likely anthracnose). Two plants removed.", photo: { kind: 'demo-placeholder', caption: "Chilli padi damage, YCT-B5 — demo photo" }, source: "demo", createdAt: "2026-10-07T19:12:00+08:00" },
]
