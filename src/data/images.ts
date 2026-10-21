import type { CropId, Site, SiteId } from '../types'

/**
 * Every image slot in the app. Drop a file at `src` (under public/) and it appears; until then the
 * UI shows a labelled gradient placeholder, never a broken image. Sizes and formats to provide:
 * public/images/README.md.
 *
 * The current files are freely licensed photos from Wikimedia Commons (CC BY / CC BY-SA). Each one's
 * source, author and licence are recorded in `credit`, shown on the photo and on /credits. To use your
 * own photo, replace the file (same name) and set `credit` to undefined, or to your own credit.
 */

export interface PhotoCredit {
  /** Title of the original work */
  title: string
  author: string
  /** Where the original lives (file page) */
  sourceUrl: string
  license: 'CC0' | 'CC BY 2.0' | 'CC BY 3.0' | 'CC BY 4.0' | 'CC BY-SA 2.0' | 'CC BY-SA 3.0' | 'CC BY-SA 4.0'
  licenseUrl: string
  /** What we changed, as CC licences ask */
  changes: string
}

export interface ImageSlot {
  /** Path under public/ */
  src: string
  /** Describes the photo; used as alt text, and as the placeholder's label */
  alt: string
  width: number
  height: number
  /** CSS object-position, to keep the subject in frame when cropped */
  focus?: string
  /** Shown as a small "Representative photo" label: not the actual site or activity */
  representative?: boolean
  /** Present when the photo is someone else's licensed work */
  credit?: PhotoCredit
}

export interface VideoSlot {
  src: string
  /** Shown before the video plays, and instead of it when motion is reduced */
  poster: ImageSlot
}

const CHANGES = 'Resized, cropped to fit and converted to WebP'
const CC_BY_SA_4 = { license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' } as const
const CC_BY_SA_3 = { license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' } as const
const CC_BY_SA_2 = { license: 'CC BY-SA 2.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/' } as const
const CC_BY_3 = { license: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' } as const
const CC0 = { license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' } as const

export const exploreHeroImage: ImageSlot = {
  src: '/images/hero/explore-hero.jpg',
  alt: 'A lush community herb garden in a Singapore estate, with a path winding between planted beds',
  width: 2400,
  height: 1800,
  focus: 'center',
  representative: true,
  credit: {
    title: 'Community Garden in Jalan Senang Estate',
    author: 'Wzhkevin',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Community_Garden_in_Jalan_Senang_Estate.jpg',
    ...CC_BY_SA_4,
    changes: CHANGES,
  },
}

/** Optional. If the file exists it plays muted and looped behind the Explore headline. */
export const exploreHeroVideo: VideoSlot = {
  src: '/images/hero/explore-hero.mp4',
  poster: exploreHeroImage,
}

/** One photo per site. All four are representative: no freely licensed photo of the beds themselves exists. */
export const siteImages: Record<SiteId, ImageSlot> = {
  'yunnan-culinary-trail': {
    src: '/images/sites/yunnan-culinary-trail.jpg',
    alt: 'Mature rain trees and lawns in Yunnan Garden, Nanyang Technological University',
    width: 2400,
    height: 1800,
    focus: 'center',
    representative: true,
    credit: {
      title: 'Yunnan Garden',
      author: 'Jeslynn',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Yunnan_Garden.jpeg',
      ...CC_BY_SA_4,
      changes: CHANGES,
    },
  },
  'hall-12-herb-spice': {
    src: '/images/sites/hall-12-herb-spice.jpg',
    alt: 'The entrance porch of Hall of Residence 12 at Nanyang Technological University',
    width: 2272,
    height: 1704,
    focus: 'center 40%',
    representative: true,
    credit: {
      title: 'NTU Hall 12',
      author: 'Kimchi.sg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:NTU_Hall_12.jpg',
      ...CC_BY_SA_3,
      changes: CHANGES,
    },
  },
  'earthlink-yunnan-corner': {
    src: '/images/sites/earthlink-yunnan-corner.jpg',
    alt: 'The Chinese Heritage Centre seen across the lawn of Yunnan Garden',
    width: 2400,
    height: 1800,
    focus: 'center',
    representative: true,
    credit: {
      title: 'Chinese Heritage Centre from Yunan Garden',
      author: 'Jeslynn',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chinese_Heritage_Centre_from_Yunan_Garden.jpeg',
      ...CC_BY_SA_4,
      changes: CHANGES,
    },
  },
  'community-herb-garden': {
    src: '/images/sites/community-herb-garden.jpg',
    alt: 'Raised planting beds in a netted community garden beside housing blocks in Singapore',
    width: 2400,
    height: 1800,
    focus: 'center 70%',
    representative: true,
    credit: {
      title: 'Community garden at Fajar in Singapore',
      author: 'Demaris99',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Community_garden_at_Fajar_in_Singapore.jpg',
      ...CC_BY_SA_4,
      changes: CHANGES,
    },
  },
}

/** Photos for the four log forms and the empty harvest-photo gallery. */
/** A site's photo slot. Sites without one (demo hall sites, newly approved sites) get a slot that shows the labelled placeholder until a photo is dropped at /images/sites/<site id>.jpg. */
export function siteImage(site: Pick<Site, 'id' | 'photoAlt'>): ImageSlot {
  return siteImages[site.id] ?? { src: `/images/sites/${site.id}.jpg`, alt: site.photoAlt, width: 2400, height: 1600 }
}

export const logImages = {
  harvest: {
    src: '/images/log/harvest.jpg',
    alt: 'Freshly harvested kangkong in a yellow colander',
    width: 2048,
    height: 1371,
    focus: 'center',
    credit: {
      title: 'Harvested - Kangkong',
      author: 'Alpha from Melbourne, Australia',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Harvested_-_Kangkong_(3446711239).jpg',
      ...CC_BY_SA_2,
      changes: CHANGES,
    },
  },
  planting: {
    src: '/images/log/planting.jpg',
    alt: 'A farm worker transplanting choy sum seedlings from trays into a soil bed',
    width: 2400,
    height: 1800,
    focus: 'center 60%',
    credit: {
      title: 'Transplanting choy sum seedlings onto soil bed at Zenxin Organic Park',
      author: 'Wee Hong',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Transplanting_choy_sum_seedlings_onto_soil_bed_at_Zenxin_Organic_Park.jpg',
      ...CC_BY_SA_4,
      changes: CHANGES,
    },
  },
  weekly: {
    src: '/images/log/weekly.jpg',
    alt: 'A green watering can pouring water in a garden',
    width: 1600,
    height: 2400,
    focus: 'center 45%',
    credit: {
      title: 'Watering-can-green',
      author: 'Kate Nielsen Photos',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Watering-can-green.jpg',
      ...CC_BY_SA_3,
      changes: CHANGES,
    },
  },
  losses: {
    src: '/images/log/losses.jpg',
    alt: 'Green leaves with holes eaten by caterpillars',
    width: 2400,
    height: 1600,
    focus: 'center',
    credit: {
      title: 'Kawakawa leaves with caterpillar damage March 2026',
      author: 'Aaron.brunet',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kawakawa_leaves_with_caterpillar_damage_March_2026.jpg',
      ...CC_BY_SA_4,
      changes: CHANGES,
    },
  },
} satisfies Record<string, ImageSlot>

export const emptyGalleryImage: ImageSlot = {
  src: '/images/dashboard/gallery-empty.jpg',
  alt: 'A clump of lemongrass growing in a tropical garden',
  width: 2400,
  height: 1800,
  focus: 'center',
  credit: {
    title: 'Cymbopogon citratus lemongrass plant in garden',
    author: 'Undeka 11',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cymbopogon_citratus_lemongrass_plant_in_garden.jpg',
    ...CC_BY_SA_4,
    changes: CHANGES,
  },
}

/**
 * Learn: one close-up per crop, shown at the "Ready" stage so a beginner knows what ready looks like.
 * Freely licensed (Wikimedia Commons); none is AI-generated and none shows NTU places or people.
 * A crop without a photo here (e.g. one a committee added) shows its drawing instead.
 */
const LEARN_CHANGES = 'Resized to 1600 px, cropped to fit and converted to WebP; metadata removed'
export const learnImages: Partial<Record<CropId, ImageSlot>> = {
  basil: {
    src: '/images/learn/basil.jpg',
    alt: 'Thai basil plants with purple flower spikes rising above the leaves',
    width: 1600,
    height: 1067,
    focus: 'center',
    credit: {
      title: 'Thai basil with flowers',
      author: 'Risacher',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Thai_basil_with_flowers.jpg',
      ...CC_BY_SA_3,
      changes: LEARN_CHANGES,
    },
  },
  mint: {
    src: '/images/learn/mint.jpg',
    alt: 'Dense upright mint stems with bright green serrated leaves',
    width: 1600,
    height: 1224,
    focus: 'center',
    credit: {
      title: 'Mint leaves (Mentha spicata)',
      author: 'Commonists',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mint_leaves_(Mentha_spicata).jpg',
      ...CC_BY_SA_4,
      changes: LEARN_CHANGES,
    },
  },
  lemongrass: {
    src: '/images/learn/lemongrass.jpg',
    alt: 'A large, full clump of lemongrass growing in bare soil',
    width: 1600,
    height: 900,
    focus: 'center',
    credit: {
      title: 'Tanglad (lemongrass, Cymbopogon citratus) - Philippines',
      author: 'Obsidian Soul',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tanglad_(lemongrass,_Cymbopogon_citratus)_-_Philippines.jpg',
      ...CC0,
      changes: LEARN_CHANGES,
    },
  },
  pandan: {
    src: '/images/learn/pandan.jpg',
    alt: 'A clump of pandan with long, glossy, strap-shaped leaves',
    width: 1600,
    height: 1200,
    focus: 'center',
    credit: {
      title: 'Pandanus amaryllifolius Malaysia',
      author: 'Tu7uh',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pandanus_amaryllifolius_Malaysia.jpg',
      ...CC_BY_3,
      changes: LEARN_CHANGES,
    },
  },
  'chilli-padi': {
    src: '/images/learn/chilli-padi.jpg',
    alt: 'A bird’s eye chilli plant with small upright red and green chillies',
    width: 1600,
    height: 1067,
    focus: 'center',
    credit: {
      title: 'Thai peppers',
      author: 'Daniel Risacher',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Thai_peppers.jpg',
      ...CC_BY_SA_3,
      changes: LEARN_CHANGES,
    },
  },
  turmeric: {
    src: '/images/learn/turmeric.jpg',
    alt: 'A heap of freshly lifted turmeric rhizomes',
    width: 1600,
    height: 1200,
    focus: 'center',
    credit: {
      title: 'Zingiberales - Curcuma longa - 1',
      author: 'Emőke Dénes',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Zingiberales_-_Curcuma_longa_-_1.jpg',
      ...CC_BY_SA_4,
      changes: LEARN_CHANGES,
    },
  },
  kangkong: {
    src: '/images/learn/kangkong.jpg',
    alt: 'A bed of tall, leafy kangkong with arrow-shaped leaves',
    width: 1600,
    height: 1200,
    focus: 'center',
    credit: {
      title: 'Ipomoea aquatica at Organic Unit, FP, UPM',
      author: 'Wee Hong',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ipomoea_aquatica_at_Organic_Unit,_FP,_UPM.jpg',
      ...CC_BY_SA_4,
      changes: LEARN_CHANGES,
    },
  },
}

/** Every slot, for the Photo credits page. */
export const allImageSlots: { use: string; slot: ImageSlot }[] = [
  { use: 'Explore page header', slot: exploreHeroImage },
  { use: 'Yunnan Garden Culinary Trail', slot: siteImages['yunnan-culinary-trail'] },
  { use: 'Hall 12 Herb & Spice Garden', slot: siteImages['hall-12-herb-spice'] },
  { use: "Earthlink's Yunnan Corner", slot: siteImages['earthlink-yunnan-corner'] },
  { use: 'NTU Community Herb Garden', slot: siteImages['community-herb-garden'] },
  { use: 'Log: harvest', slot: logImages.harvest },
  { use: 'Log: planting', slot: logImages.planting },
  { use: 'Log: weekly inputs', slot: logImages.weekly },
  { use: 'Log: plant losses', slot: logImages.losses },
  { use: 'Dashboard: empty photo gallery', slot: emptyGalleryImage },
  ...Object.entries(learnImages).flatMap(([cropId, slot]) =>
    slot ? [{ use: `Learn: ${cropId.replace('-', ' ')} when ready`, slot }] : [],
  ),
]
