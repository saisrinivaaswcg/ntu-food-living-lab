/**
 * "Start a garden at your hall": bed sizes, an indicative starter kit and the steps.
 * DEMONSTRATION DATA: prices are indicative (typical Singapore retail, 2026) and must be checked
 * before a hall budgets with them.
 */

export interface BedSize {
  id: string
  name: string
  /** Growing area in m² */
  areaSqm: number
  fits: string
  /** Starter kit items: quantity of each, per bed */
  kit: Record<StarterItemId, number>
}

export type StarterItemId = 'planter' | 'soil' | 'compost' | 'plants' | 'can' | 'tools'

export interface StarterItem {
  id: StarterItemId
  name: string
  unit: string
  /** SGD per unit */
  price: number
}

export const starterItems: StarterItem[] = [
  { id: 'planter', name: 'Raised planter or trough', unit: 'each', price: 65 },
  { id: 'soil', name: 'Potting mix', unit: '40 L bag', price: 12 },
  { id: 'compost', name: 'Compost or vermicompost', unit: '10 kg bag', price: 9 },
  { id: 'plants', name: 'Seeds, cuttings and seedlings', unit: 'set', price: 15 },
  { id: 'can', name: 'Watering can with rose', unit: 'each', price: 10 },
  { id: 'tools', name: 'Trowel, secateurs and gloves', unit: 'set', price: 20 },
]

export const bedSizes: BedSize[] = [
  { id: 'trough', name: 'One trough', areaSqm: 0.5, fits: 'A corridor ledge or balcony', kit: { planter: 1, soil: 2, compost: 1, plants: 1, can: 1, tools: 1 } },
  { id: 'planter', name: 'One planter box', areaSqm: 1.5, fits: 'Beside a hall lounge or void deck', kit: { planter: 1, soil: 5, compost: 2, plants: 1, can: 1, tools: 1 } },
  { id: 'trio', name: 'Three planter boxes', areaSqm: 4.5, fits: 'A small courtyard or rooftop corner', kit: { planter: 3, soil: 15, compost: 5, plants: 2, can: 2, tools: 2 } },
  { id: 'bed', name: 'An in-ground bed', areaSqm: 6, fits: 'A lawn edge the hall agrees to give up', kit: { planter: 0, soil: 8, compost: 8, plants: 3, can: 2, tools: 2 } },
]

export const startSteps: { title: string; detail: string }[] = [
  { title: 'Find a spot with sun and a tap', detail: 'Six hours of sun, a tap within reach, shelter from the worst rain. Rooftops and corridor ledges count.' },
  { title: 'Get your hall on board', detail: 'Ask the hall office and JCRC for the spot. Bring the bed size and starter cost from this page.' },
  { title: 'Form a team of four', detail: 'Enough for a watering roster through recess weeks, which is when most plants are lost.' },
  { title: 'Request the site here', detail: 'Drop a pin, list the beds and add a photo. The Sustainability Office approves it and the garden goes on the map.' },
  { title: 'Plant the easy crops first', detail: 'Start with the top of the list below: the ones that survive best at NTU. Add harder crops in term two.' },
  { title: 'Log every week', detail: 'One weekly-inputs record keeps your data complete, counts for the Hall Garden Cup, and helps the next committee.' },
]
