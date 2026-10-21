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

/** Credit shown on AI-made illustrations (made by the project team, see docs/IMAGE_PROMPTS.md). */
export const AI_CREDIT = 'AI illustration'

export interface ImageSlot {
  /** Path under public/ */
  src: string
  /** 'illustration': a drawn image (AI-made slots are listed in docs/IMAGE_PROMPTS.md). Default 'photo'. */
  kind?: 'photo' | 'illustration'
  /** Made with an AI image tool: always credited "AI illustration" */
  aiGenerated?: boolean
  /** Describes the photo; used as alt text, and as the placeholder's label */
  alt: string
  width: number
  height: number
  /** CSS object-position, to keep the subject in frame when cropped */
  focus?: string
  /** Shown as a small "Representative photo" label: not the actual site or activity */
  representative?: boolean
  /** Someone else's licensed work, or "AI illustration" for AI-made illustrations */
  credit?: PhotoCredit | typeof AI_CREDIT
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

/* ------------------------------------------------------------------ */
/* AI illustrations (made by the team; prompts in docs/IMAGE_PROMPTS.md) */
/* ------------------------------------------------------------------ */

const ILLUSTRATION_DIR = '/images/illustrations'

function illustration(path: string, alt: string, width: number, height: number): ImageSlot {
  return { src: `${ILLUSTRATION_DIR}/${path}`, alt, width, height, kind: 'illustration', aiGenerated: true, credit: AI_CREDIT }
}

/**
 * Slots for AI illustrations. Drop a PNG or JPG with the slot's name (any of .png/.jpg/.jpeg/.webp) into
 * public/images/illustrations/… and it is served as resized WebP. Until then each one falls back to the
 * SVG drawing or simply isn't shown: never a broken image.
 */
export const illustrations = {
  /** Header of each crop's plate on /learn (falls back to the SVG drawing) */
  learnCrops: {
    basil: illustration('learn/basil.png', 'Botanical illustration of a Thai basil plant with purple flower spikes', 1600, 2000),
    mint: illustration('learn/mint.png', 'Botanical illustration of a spreading mint plant with runners', 1600, 2000),
    lemongrass: illustration('learn/lemongrass.png', 'Botanical illustration of a lemongrass clump with pale stalks', 1600, 2000),
    pandan: illustration('learn/pandan.png', 'Botanical illustration of a pandan rosette with long glossy leaves', 1600, 2000),
    'chilli-padi': illustration('learn/chilli-padi.png', 'Botanical illustration of a chilli padi shrub with small upright red chillies', 1600, 2000),
    turmeric: illustration('learn/turmeric.png', 'Botanical illustration of a turmeric plant with broad leaves and orange rhizomes', 1600, 2000),
    kangkong: illustration('learn/kangkong.png', 'Botanical illustration of kangkong with arrow-shaped leaves on hollow stems', 1600, 2000),
  } as Record<CropId, ImageSlot>,
  /** Page headers (not shown until the file exists) */
  heroes: {
    learn: illustration('hero/learn.png', 'Illustration of seedlings growing in a row of pots, from seed to harvest', 1600, 1200),
    join: illustration('hero/join.png', 'Illustration of garden tools, gloves and a watering can beside a raised herb bed', 1600, 1200),
    hallCup: illustration('hero/hall-cup.png', 'Illustration of a trophy-shaped planter overflowing with herbs', 1600, 1200),
    getInvolved: illustration('hero/get-involved.png', 'Illustration of a harvest basket, a calendar card and secateurs on a potting bench', 1600, 1200),
    startGarden: illustration('hero/start-a-garden.png', 'Illustration of an empty corridor ledge turned into a row of planter boxes', 1600, 1200),
  },
  /** Small pictures in empty states (fall back to the plain empty-state icon) */
  empty: {
    tasks: illustration('empty/no-tasks.png', 'Illustration of a clipboard with a blank task list leaning on a pot', 800, 800),
    ready: illustration('empty/nothing-ready.png', 'Illustration of a small seedling in a pot, not ready yet', 800, 800),
    gardens: illustration('empty/no-gardens.png', 'Illustration of an empty seed tray waiting for its first seeds', 800, 800),
    notFound: illustration('empty/not-found.png', 'Illustration of a garden path that ends at a closed wooden gate', 800, 800),
  },
} satisfies Record<string, Record<string, ImageSlot>>

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
  ...Object.entries(illustrations.learnCrops).map(([cropId, slot]) => ({ use: `Learn: ${cropId.replace('-', ' ')} plate`, slot })),
  { use: 'Learn page header', slot: illustrations.heroes.learn },
  { use: 'Join page header', slot: illustrations.heroes.join },
  { use: 'Hall Garden Cup header', slot: illustrations.heroes.hallCup },
  { use: 'Get involved header', slot: illustrations.heroes.getInvolved },
  { use: 'Start a hall garden header', slot: illustrations.heroes.startGarden },
  { use: 'Empty state: no tasks', slot: illustrations.empty.tasks },
  { use: 'Empty state: nothing ready', slot: illustrations.empty.ready },
  { use: 'Empty state: no gardens joined', slot: illustrations.empty.gardens },
  { use: 'Page not found', slot: illustrations.empty.notFound },
]
