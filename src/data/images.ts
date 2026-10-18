import type { SiteId } from '../types'
import { sites } from './sites'

/**
 * Every image slot in the app. Drop a file at `src` (under /public) and it appears;
 * until then the UI shows a labelled gradient placeholder, never a broken image.
 * Sizes and formats to provide: public/images/README.md.
 */
export interface ImageSlot {
  /** Path under /public */
  src: string
  /** Describes the intended photo; used as alt text, and as the placeholder's label */
  alt: string
  width: number
  height: number
  /** CSS object-position, to keep the subject in frame when cropped */
  focus?: string
}

export interface VideoSlot {
  src: string
  /** Shown before the video plays, and instead of it when motion is reduced */
  poster: ImageSlot
}

export const exploreHeroImage: ImageSlot = {
  src: '/images/hero/explore-hero.jpg',
  alt: 'Volunteers harvesting herbs from raised beds in a campus garden',
  width: 2400,
  height: 1350,
  focus: 'center',
}

/** Optional. If the file exists it plays muted and looped behind the Explore headline. */
export const exploreHeroVideo: VideoSlot = {
  src: '/images/hero/explore-hero.mp4',
  poster: exploreHeroImage,
}

/** One photo per site; alt text comes from the site record. */
export const siteImages: Record<SiteId, ImageSlot> = Object.fromEntries(
  sites.map((site) => [
    site.id,
    { src: `/images/sites/${site.id}.jpg`, alt: site.photoAlt, width: 1600, height: 1200, focus: 'center' },
  ]),
) as Record<SiteId, ImageSlot>
