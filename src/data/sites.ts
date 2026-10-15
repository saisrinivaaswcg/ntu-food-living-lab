import type { Site } from '../types'

/**
 * DEMONSTRATION DATA — the four campus growing sites.
 * Coordinates are approximate (placed from public descriptions of each location);
 * confirm each pin on site before using the map for wayfinding.
 */

/** Map centre and zoom that frame all four sites on the NTU campus. */
export const CAMPUS_MAP_VIEW = {
  center: [1.3485, 103.6845] as [number, number],
  zoom: 15,
}

export const sites: Site[] = [
  {
    id: 'yunnan-culinary-trail',
    name: 'Yunnan Garden Culinary Trail',
    shortName: 'Yunnan Trail',
    description:
      'An edible trail of raised beds along the Yunnan Garden boardwalk, growing Southeast Asian cooking herbs with interpretive signage for visitors.',
    coordinates: [1.3446, 103.6874],
    locationNote: 'Yunnan Garden, along the boardwalk near Nanyang Lake',
    status: 'active',
    statusNote: 'All six beds in production. Turmeric harvest under way.',
    managedBy: 'Yunnan Garden Culinary Trail Committee',
    established: '2024-08-19',
    areaSqm: 64,
    beds: [
      { id: 'YCT-B1', label: 'Bed 1 (raised, full sun)' },
      { id: 'YCT-B2', label: 'Bed 2 (raised, full sun)' },
      { id: 'YCT-B3', label: 'Bed 3 (raised, part shade)' },
      { id: 'YCT-B4', label: 'Bed 4 (in-ground)' },
      { id: 'YCT-B5', label: 'Bed 5 (in-ground)' },
      { id: 'YCT-B6', label: 'Bed 6 (planter row)' },
    ],
    photoAlt: 'Raised herb beds beside a timber boardwalk in Yunnan Garden',
  },
  {
    id: 'hall-12-herb-spice',
    name: 'Hall 12 Herb & Spice Garden',
    shortName: 'Hall 12',
    description:
      'Resident-run planter-box garden at Hall of Residence 12. Herbs and chillies go to hall events and the student pantry.',
    coordinates: [1.3516, 103.6808],
    locationNote: 'Hall of Residence 12, edible garden planter boxes',
    status: 'active',
    statusNote: 'Four planter boxes active. Chilli padi fruiting.',
    managedBy: 'Hall 12 Green Committee',
    established: '2023-01-16',
    areaSqm: 18,
    beds: [
      { id: 'H12-B1', label: 'Planter box A' },
      { id: 'H12-B2', label: 'Planter box B' },
      { id: 'H12-B3', label: 'Planter box C' },
      { id: 'H12-B4', label: 'Planter box D' },
    ],
    photoAlt: 'Row of wooden planter boxes with basil and chilli plants outside a residential hall',
  },
  {
    id: 'earthlink-yunnan-corner',
    name: "Earthlink's Yunnan Corner",
    shortName: 'Yunnan Corner',
    description:
      'A low-input demonstration plot run by the Earthlink environmental club, trialling water-saving methods and kangkong in wicking beds.',
    coordinates: [1.3437, 103.6893],
    locationNote: 'Eastern corner of Yunnan Garden, near the Chinese Heritage Centre',
    status: 'needs-attention',
    statusNote: 'Kangkong bed lost to drought in September. Irrigation fix pending.',
    managedBy: 'Earthlink NTU',
    established: '2025-02-10',
    areaSqm: 30,
    beds: [
      { id: 'EYC-B1', label: 'Wicking bed 1' },
      { id: 'EYC-B2', label: 'Wicking bed 2' },
      { id: 'EYC-B3', label: 'In-ground bed (shade)' },
      { id: 'EYC-B4', label: 'In-ground bed (sun)' },
      { id: 'EYC-B5', label: 'Grow-bag row' },
    ],
    photoAlt: 'Wicking beds with leafy kangkong and pandan clumps under a tree canopy',
  },
  {
    id: 'community-herb-garden',
    name: 'NTU Community Herb Garden',
    shortName: 'Herb Garden',
    description:
      'Long-running terraced herb garden near the Jalan Bahar entrance. The student section grows culinary herbs alongside the medicinal collection.',
    coordinates: [1.3537, 103.6874],
    locationNote: 'Near the Jalan Bahar entrance, off Nanyang Avenue',
    status: 'active',
    statusNote: 'Eight terrace beds in the student section. Steady weekly harvests.',
    managedBy: 'Community Herb Garden Student Committee',
    established: '2009-06-01',
    areaSqm: 90,
    beds: [
      { id: 'CHG-T1', label: 'Terrace 1' },
      { id: 'CHG-T2', label: 'Terrace 2' },
      { id: 'CHG-T3', label: 'Terrace 3' },
      { id: 'CHG-T4', label: 'Terrace 4' },
      { id: 'CHG-T5', label: 'Terrace 5' },
      { id: 'CHG-T6', label: 'Terrace 6' },
      { id: 'CHG-T7', label: 'Terrace 7 (shade house)' },
      { id: 'CHG-T8', label: 'Terrace 8 (shade house)' },
    ],
    photoAlt: 'Terraced herb beds on a gentle slope with paved paths',
  },
]
