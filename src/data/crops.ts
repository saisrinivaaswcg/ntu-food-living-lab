import type { Crop } from '../types'

/** Controlled crop vocabulary — the only crops the Log forms accept. Add new crops here. */
export const crops: Crop[] = [
  { id: 'basil', name: 'Thai basil', scientificName: 'Ocimum basilicum var. thyrsiflora', daysToFirstHarvest: 45 },
  { id: 'mint', name: 'Mint', localName: 'Pudina', scientificName: 'Mentha spp.', daysToFirstHarvest: 50 },
  { id: 'lemongrass', name: 'Lemongrass', localName: 'Serai', scientificName: 'Cymbopogon citratus', daysToFirstHarvest: 100 },
  { id: 'pandan', name: 'Pandan', localName: 'Daun pandan', scientificName: 'Pandanus amaryllifolius', daysToFirstHarvest: 90 },
  { id: 'chilli-padi', name: 'Chilli padi', localName: 'Cili padi', scientificName: 'Capsicum frutescens', daysToFirstHarvest: 85 },
  { id: 'turmeric', name: 'Turmeric', localName: 'Kunyit', scientificName: 'Curcuma longa', daysToFirstHarvest: 240 },
  { id: 'kangkong', name: 'Kangkong', localName: 'Water spinach', scientificName: 'Ipomoea aquatica', daysToFirstHarvest: 28 },
]
