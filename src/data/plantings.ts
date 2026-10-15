import type { PlantingLog } from '../types'

/**
 * DEMONSTRATION DATA — generated for the prototype, not real measurements.
 * Replace this array with real records (same shape) when the platform goes live.
 */
export const demoPlantings: PlantingLog[] = [
  { id: "demo-p-001", siteId: "earthlink-yunnan-corner", bedId: "EYC-B3", cropId: "pandan", date: "2025-11-17", quantity: 10, propagation: "cutting", source: "demo", createdAt: "2025-11-17T18:48:00+08:00" },
  { id: "demo-p-002", siteId: "yunnan-culinary-trail", bedId: "YCT-B4", cropId: "turmeric", date: "2026-01-12", quantity: 36, propagation: "cutting", notes: "Rhizome pieces from a Pasir Panjang supplier, 2 buds each.", source: "demo", createdAt: "2026-01-12T18:20:00+08:00" },
  { id: "demo-p-003", siteId: "community-herb-garden", bedId: "CHG-T6", cropId: "pandan", date: "2026-02-02", quantity: 14, propagation: "cutting", source: "demo", createdAt: "2026-02-02T18:55:00+08:00" },
  { id: "demo-p-004", siteId: "earthlink-yunnan-corner", bedId: "EYC-B4", cropId: "turmeric", date: "2026-02-09", quantity: 24, propagation: "cutting", source: "demo", createdAt: "2026-02-09T18:20:00+08:00" },
  { id: "demo-p-005", siteId: "yunnan-culinary-trail", bedId: "YCT-B3", cropId: "pandan", date: "2026-03-02", quantity: 12, propagation: "cutting", notes: "Suckers divided from the Herb Garden clump.", source: "demo", createdAt: "2026-03-02T18:48:00+08:00" },
  { id: "demo-p-006", siteId: "community-herb-garden", bedId: "CHG-T3", cropId: "lemongrass", date: "2026-03-16", quantity: 24, propagation: "cutting", source: "demo", createdAt: "2026-03-16T18:48:00+08:00" },
  { id: "demo-p-007", siteId: "yunnan-culinary-trail", bedId: "YCT-B2", cropId: "lemongrass", date: "2026-04-06", quantity: 30, propagation: "cutting", source: "demo", createdAt: "2026-04-06T18:34:00+08:00" },
  { id: "demo-p-008", siteId: "hall-12-herb-spice", bedId: "H12-B4", cropId: "lemongrass", date: "2026-04-20", quantity: 16, propagation: "cutting", source: "demo", createdAt: "2026-04-20T18:48:00+08:00" },
  { id: "demo-p-009", siteId: "community-herb-garden", bedId: "CHG-T1", cropId: "mint", date: "2026-05-11", quantity: 30, propagation: "cutting", source: "demo", createdAt: "2026-05-11T18:20:00+08:00" },
  { id: "demo-p-010", siteId: "hall-12-herb-spice", bedId: "H12-B3", cropId: "chilli-padi", date: "2026-05-18", quantity: 12, propagation: "seedling", source: "demo", createdAt: "2026-05-18T18:12:00+08:00" },
  { id: "demo-p-011", siteId: "hall-12-herb-spice", bedId: "H12-B2", cropId: "mint", date: "2026-05-25", quantity: 20, propagation: "cutting", notes: "Cuttings rooted in water for 10 days first.", source: "demo", createdAt: "2026-05-25T18:48:00+08:00" },
  { id: "demo-p-012", siteId: "community-herb-garden", bedId: "CHG-T2", cropId: "basil", date: "2026-06-01", quantity: 50, propagation: "seed", source: "demo", createdAt: "2026-06-01T18:48:00+08:00" },
  { id: "demo-p-013", siteId: "yunnan-culinary-trail", bedId: "YCT-B1", cropId: "basil", date: "2026-06-08", quantity: 40, propagation: "seed", source: "demo", createdAt: "2026-06-08T18:05:00+08:00" },
  { id: "demo-p-014", siteId: "community-herb-garden", bedId: "CHG-T5", cropId: "chilli-padi", date: "2026-06-08", quantity: 20, propagation: "seedling", source: "demo", createdAt: "2026-06-08T18:05:00+08:00" },
  { id: "demo-p-015", siteId: "hall-12-herb-spice", bedId: "H12-B1", cropId: "basil", date: "2026-06-15", quantity: 30, propagation: "seed", source: "demo", createdAt: "2026-06-15T18:41:00+08:00" },
  { id: "demo-p-016", siteId: "yunnan-culinary-trail", bedId: "YCT-B5", cropId: "chilli-padi", date: "2026-06-22", quantity: 18, propagation: "seedling", notes: "Seedlings raised in the shade house.", source: "demo", createdAt: "2026-06-22T18:20:00+08:00" },
  { id: "demo-p-017", siteId: "earthlink-yunnan-corner", bedId: "EYC-B5", cropId: "mint", date: "2026-06-29", quantity: 16, propagation: "cutting", notes: "Grow bags, trial of coir mix.", source: "demo", createdAt: "2026-06-29T18:05:00+08:00" },
  { id: "demo-p-018", siteId: "earthlink-yunnan-corner", bedId: "EYC-B1", cropId: "kangkong", date: "2026-07-06", quantity: 120, propagation: "seed", notes: "Wicking bed reservoir filled to max line.", source: "demo", createdAt: "2026-07-06T18:48:00+08:00" },
  { id: "demo-p-019", siteId: "community-herb-garden", bedId: "CHG-T4", cropId: "kangkong", date: "2026-07-13", quantity: 150, propagation: "seed", source: "demo", createdAt: "2026-07-13T18:55:00+08:00" },
  { id: "demo-p-020", siteId: "community-herb-garden", bedId: "CHG-T8", cropId: "mint", date: "2026-07-20", quantity: 20, propagation: "cutting", notes: "Shade-house trial for mint during the hot months.", source: "demo", createdAt: "2026-07-20T18:20:00+08:00" },
  { id: "demo-p-021", siteId: "earthlink-yunnan-corner", bedId: "EYC-B2", cropId: "kangkong", date: "2026-08-10", quantity: 60, propagation: "cutting", notes: "Cuttings from Bed 1.", source: "demo", createdAt: "2026-08-10T18:48:00+08:00" },
  { id: "demo-p-022", siteId: "community-herb-garden", bedId: "CHG-T7", cropId: "basil", date: "2026-08-17", quantity: 30, propagation: "seedling", source: "demo", createdAt: "2026-08-17T18:34:00+08:00" },
  { id: "demo-p-023", siteId: "yunnan-culinary-trail", bedId: "YCT-B6", cropId: "basil", date: "2026-08-24", quantity: 24, propagation: "seedling", notes: "Succession planting so basil continues when Bed 1 goes woody.", source: "demo", createdAt: "2026-08-24T18:12:00+08:00" },
  { id: "demo-p-024", siteId: "earthlink-yunnan-corner", bedId: "EYC-B1", cropId: "kangkong", date: "2026-09-28", quantity: 60, propagation: "cutting", notes: "Replanted after the September drought loss.", source: "demo", createdAt: "2026-09-28T18:20:00+08:00" },
]
