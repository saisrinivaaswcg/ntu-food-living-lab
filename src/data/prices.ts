import type { CostAssumptions, SupermarketPrice } from '../types'

/**
 * DEMONSTRATION DATA — illustrative supermarket prices in SGD per kg.
 * Replace with a dated price survey (same shape) before quoting any figure.
 * null = not commonly sold as a local product.
 */
export const PRICE_SURVEY_DATE = '2026-10 (illustrative)'

export const supermarketPrices: SupermarketPrice[] = [
  { cropId: 'basil', importedPerKg: 18.0, importedOrigin: 'Malaysia', localPerKg: 28.0 },
  { cropId: 'mint', importedPerKg: 20.0, importedOrigin: 'Malaysia', localPerKg: 40.0 },
  { cropId: 'lemongrass', importedPerKg: 6.0, importedOrigin: 'Thailand', localPerKg: 8.0 },
  { cropId: 'pandan', importedPerKg: 10.0, importedOrigin: 'Malaysia', localPerKg: 12.0 },
  { cropId: 'chilli-padi', importedPerKg: 15.0, importedOrigin: 'Thailand', localPerKg: null },
  { cropId: 'turmeric', importedPerKg: 8.0, importedOrigin: 'Indonesia', localPerKg: null },
  { cropId: 'kangkong', importedPerKg: 4.8, importedOrigin: 'Malaysia', localPerKg: 6.5 },
]

/**
 * Inputs used to estimate campus cost per kg.
 * Water and compost are logged per site per week, so they are shared across a site's
 * crops in proportion to the beds each crop occupies (see lib/metrics.ts).
 */
export const costAssumptions: CostAssumptions = {
  currency: 'SGD',
  // Approx. potable water price incl. taxes (~S$3.70 per m³) — illustrative
  waterPerLitre: 0.0037,
  compostPerKg: {
    vermicompost: 1.5, // bought in
    'food-waste-compost': 0, // from the campus food-waste digester
    'leaf-mould': 0, // made on site
    none: 0,
  },
  propagationPerUnit: {
    seed: 0.05,
    cutting: 0, // taken from existing plants
    seedling: 0.8,
  },
  labourPerHour: 0,
  notes: [
    'Volunteer labour is unpaid, so it is excluded by default.',
    'Tools, beds and other one-off set-up costs are not included.',
  ],
}
