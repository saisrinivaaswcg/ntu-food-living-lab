import type { WeeklyInputLog } from '../types'

/**
 * DEMONSTRATION DATA — generated for the prototype, not real measurements.
 * Replace this array with real records (same shape) when the platform goes live.
 *
 * A site-week with no record here counts as NOT logged in the data completeness score.
 */
export const demoWeeklyInputs: WeeklyInputLog[] = [
  { id: "demo-w-001", siteId: "community-herb-garden", weekStart: "2026-07-13", waterLitres: 650, compostType: "vermicompost", compostKg: 20.0, labourHours: 11.5, source: "demo", createdAt: "2026-07-19T20:20:00+08:00" },
  { id: "demo-w-002", siteId: "earthlink-yunnan-corner", weekStart: "2026-07-13", waterLitres: 240, compostType: "leaf-mould", compostKg: 7.5, labourHours: 6.0, source: "demo", createdAt: "2026-07-19T20:41:00+08:00" },
  { id: "demo-w-003", siteId: "hall-12-herb-spice", weekStart: "2026-07-13", waterLitres: 160, compostType: "vermicompost", compostKg: 2.5, labourHours: 3.0, source: "demo", createdAt: "2026-07-19T20:55:00+08:00" },
  { id: "demo-w-004", siteId: "yunnan-culinary-trail", weekStart: "2026-07-13", waterLitres: 480, compostType: "food-waste-compost", compostKg: 9.0, labourHours: 9.5, source: "demo", createdAt: "2026-07-19T20:41:00+08:00" },
  { id: "demo-w-005", siteId: "community-herb-garden", weekStart: "2026-07-20", waterLitres: 740, compostType: "food-waste-compost", compostKg: 19.5, labourHours: 10.0, source: "demo", createdAt: "2026-07-26T20:48:00+08:00" },
  { id: "demo-w-006", siteId: "earthlink-yunnan-corner", weekStart: "2026-07-20", waterLitres: 200, compostType: "leaf-mould", compostKg: 5.5, labourHours: 7.5, source: "demo", createdAt: "2026-07-26T20:34:00+08:00" },
  { id: "demo-w-007", siteId: "hall-12-herb-spice", weekStart: "2026-07-20", waterLitres: 160, compostType: "vermicompost", compostKg: 5.5, labourHours: 4.0, source: "demo", createdAt: "2026-07-26T20:05:00+08:00" },
  { id: "demo-w-008", siteId: "yunnan-culinary-trail", weekStart: "2026-07-20", waterLitres: 480, compostType: "food-waste-compost", compostKg: 11.5, labourHours: 7.0, notes: "Watering roster: 3 volunteers, mornings only.", source: "demo", createdAt: "2026-07-26T20:41:00+08:00" },
  { id: "demo-w-009", siteId: "community-herb-garden", weekStart: "2026-07-27", waterLitres: 800, compostType: "food-waste-compost", compostKg: 19.5, labourHours: 12.0, source: "demo", createdAt: "2026-08-02T20:05:00+08:00" },
  { id: "demo-w-010", siteId: "hall-12-herb-spice", weekStart: "2026-07-27", waterLitres: 160, compostType: "vermicompost", compostKg: 4.0, labourHours: 5.0, source: "demo", createdAt: "2026-08-02T20:12:00+08:00" },
  { id: "demo-w-011", siteId: "yunnan-culinary-trail", weekStart: "2026-07-27", waterLitres: 590, compostType: "food-waste-compost", compostKg: 11.0, labourHours: 9.0, source: "demo", createdAt: "2026-08-02T20:55:00+08:00" },
  { id: "demo-w-012", siteId: "community-herb-garden", weekStart: "2026-08-03", waterLitres: 610, compostType: "food-waste-compost", compostKg: 20.5, labourHours: 13.0, source: "demo", createdAt: "2026-08-09T20:12:00+08:00" },
  { id: "demo-w-013", siteId: "earthlink-yunnan-corner", weekStart: "2026-08-03", waterLitres: 300, compostType: "leaf-mould", compostKg: 4.5, labourHours: 7.5, source: "demo", createdAt: "2026-08-09T20:05:00+08:00" },
  { id: "demo-w-014", siteId: "yunnan-culinary-trail", weekStart: "2026-08-03", waterLitres: 390, compostType: "food-waste-compost", compostKg: 9.0, labourHours: 7.5, source: "demo", createdAt: "2026-08-09T20:55:00+08:00" },
  { id: "demo-w-015", siteId: "community-herb-garden", weekStart: "2026-08-10", waterLitres: 700, compostType: "vermicompost", compostKg: 13.5, labourHours: 11.0, source: "demo", createdAt: "2026-08-16T20:41:00+08:00" },
  { id: "demo-w-016", siteId: "earthlink-yunnan-corner", weekStart: "2026-08-10", waterLitres: 370, compostType: "leaf-mould", compostKg: 9.0, labourHours: 7.0, source: "demo", createdAt: "2026-08-16T20:41:00+08:00" },
  { id: "demo-w-017", siteId: "earthlink-yunnan-corner", weekStart: "2026-08-17", waterLitres: 300, compostType: "leaf-mould", compostKg: 5.0, labourHours: 4.5, source: "demo", createdAt: "2026-08-23T20:05:00+08:00" },
  { id: "demo-w-018", siteId: "hall-12-herb-spice", weekStart: "2026-08-17", waterLitres: 230, compostType: "vermicompost", compostKg: 3.0, labourHours: 6.0, notes: "Back to normal roster after orientation weeks.", source: "demo", createdAt: "2026-08-23T20:12:00+08:00" },
  { id: "demo-w-019", siteId: "yunnan-culinary-trail", weekStart: "2026-08-17", waterLitres: 390, compostType: "food-waste-compost", compostKg: 14.5, labourHours: 9.5, source: "demo", createdAt: "2026-08-23T20:55:00+08:00" },
  { id: "demo-w-020", siteId: "community-herb-garden", weekStart: "2026-08-24", waterLitres: 710, compostType: "food-waste-compost", compostKg: 11.0, labourHours: 9.5, source: "demo", createdAt: "2026-08-30T20:48:00+08:00" },
  { id: "demo-w-021", siteId: "earthlink-yunnan-corner", weekStart: "2026-08-24", waterLitres: 370, compostType: "leaf-mould", compostKg: 5.5, labourHours: 4.5, source: "demo", createdAt: "2026-08-30T20:12:00+08:00" },
  { id: "demo-w-022", siteId: "hall-12-herb-spice", weekStart: "2026-08-24", waterLitres: 150, compostType: "none", compostKg: 0, labourHours: 4.5, source: "demo", createdAt: "2026-08-30T20:20:00+08:00" },
  { id: "demo-w-023", siteId: "yunnan-culinary-trail", weekStart: "2026-08-24", waterLitres: 380, compostType: "food-waste-compost", compostKg: 16.0, labourHours: 8.5, source: "demo", createdAt: "2026-08-30T20:34:00+08:00" },
  { id: "demo-w-024", siteId: "community-herb-garden", weekStart: "2026-08-31", waterLitres: 550, compostType: "food-waste-compost", compostKg: 14.5, labourHours: 10.5, source: "demo", createdAt: "2026-09-06T20:12:00+08:00" },
  { id: "demo-w-025", siteId: "hall-12-herb-spice", weekStart: "2026-08-31", waterLitres: 190, compostType: "vermicompost", compostKg: 4.5, labourHours: 4.0, source: "demo", createdAt: "2026-09-06T20:20:00+08:00" },
  { id: "demo-w-026", siteId: "yunnan-culinary-trail", weekStart: "2026-08-31", waterLitres: 490, compostType: "food-waste-compost", compostKg: 17.0, labourHours: 8.5, source: "demo", createdAt: "2026-09-06T20:34:00+08:00" },
  { id: "demo-w-027", siteId: "community-herb-garden", weekStart: "2026-09-07", waterLitres: 810, compostType: "vermicompost", compostKg: 15.5, labourHours: 13.0, notes: "Heavy afternoon rain three days; watered only twice.", source: "demo", createdAt: "2026-09-13T20:34:00+08:00" },
  { id: "demo-w-028", siteId: "earthlink-yunnan-corner", weekStart: "2026-09-07", waterLitres: 190, compostType: "leaf-mould", compostKg: 5.5, labourHours: 8.0, notes: "Reservoir refilled once. Recess week next — need cover.", source: "demo", createdAt: "2026-09-13T20:41:00+08:00" },
  { id: "demo-w-029", siteId: "hall-12-herb-spice", weekStart: "2026-09-07", waterLitres: 140, compostType: "vermicompost", compostKg: 2.5, labourHours: 6.0, source: "demo", createdAt: "2026-09-13T20:34:00+08:00" },
  { id: "demo-w-030", siteId: "yunnan-culinary-trail", weekStart: "2026-09-07", waterLitres: 440, compostType: "none", compostKg: 0, labourHours: 7.0, source: "demo", createdAt: "2026-09-13T20:55:00+08:00" },
  { id: "demo-w-031", siteId: "community-herb-garden", weekStart: "2026-09-14", waterLitres: 640, compostType: "vermicompost", compostKg: 20.5, labourHours: 8.5, source: "demo", createdAt: "2026-09-20T20:55:00+08:00" },
  { id: "demo-w-032", siteId: "hall-12-herb-spice", weekStart: "2026-09-14", waterLitres: 150, compostType: "vermicompost", compostKg: 2.5, labourHours: 3.0, source: "demo", createdAt: "2026-09-20T20:20:00+08:00" },
  { id: "demo-w-033", siteId: "yunnan-culinary-trail", weekStart: "2026-09-14", waterLitres: 430, compostType: "none", compostKg: 0, labourHours: 7.5, source: "demo", createdAt: "2026-09-20T20:12:00+08:00" },
  { id: "demo-w-034", siteId: "community-herb-garden", weekStart: "2026-09-21", waterLitres: 470, compostType: "vermicompost", compostKg: 20.0, labourHours: 10.5, source: "demo", createdAt: "2026-09-27T20:05:00+08:00" },
  { id: "demo-w-035", siteId: "earthlink-yunnan-corner", weekStart: "2026-09-21", waterLitres: 160, compostType: "leaf-mould", compostKg: 9.0, labourHours: 7.5, notes: "Cleared dead kangkong from Bed 1, bed prepped for replanting.", source: "demo", createdAt: "2026-09-27T20:55:00+08:00" },
  { id: "demo-w-036", siteId: "yunnan-culinary-trail", weekStart: "2026-09-21", waterLitres: 360, compostType: "food-waste-compost", compostKg: 12.0, labourHours: 7.5, source: "demo", createdAt: "2026-09-27T20:41:00+08:00" },
  { id: "demo-w-037", siteId: "community-herb-garden", weekStart: "2026-09-28", waterLitres: 520, compostType: "vermicompost", compostKg: 16.5, labourHours: 8.5, source: "demo", createdAt: "2026-10-04T20:20:00+08:00" },
  { id: "demo-w-038", siteId: "hall-12-herb-spice", weekStart: "2026-09-28", waterLitres: 130, compostType: "vermicompost", compostKg: 3.0, labourHours: 6.0, source: "demo", createdAt: "2026-10-04T20:55:00+08:00" },
  { id: "demo-w-039", siteId: "community-herb-garden", weekStart: "2026-10-05", waterLitres: 560, compostType: "vermicompost", compostKg: 15.5, labourHours: 8.0, source: "demo", createdAt: "2026-10-11T20:48:00+08:00" },
  { id: "demo-w-040", siteId: "earthlink-yunnan-corner", weekStart: "2026-10-05", waterLitres: 260, compostType: "leaf-mould", compostKg: 10.0, labourHours: 6.0, source: "demo", createdAt: "2026-10-11T20:05:00+08:00" },
  { id: "demo-w-041", siteId: "yunnan-culinary-trail", weekStart: "2026-10-05", waterLitres: 410, compostType: "none", compostKg: 0, labourHours: 9.5, source: "demo", createdAt: "2026-10-11T20:34:00+08:00" },
]
