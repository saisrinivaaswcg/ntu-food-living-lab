/**
 * The hero photo is the largest thing on the Explore and site pages, but the browser only finds it once
 * the page's code has loaded. Start fetching it as soon as the app starts, in the right size.
 */
import { exploreHeroImage, imageAsset, siteImages } from '../data'
import type { SiteId } from '../types'

export function preloadHeroImage(pathname: string): void {
  const siteId = pathname.match(/^\/sites\/([^/]+)$/)?.[1] as SiteId | undefined
  const slot = pathname === '/' ? exploreHeroImage : siteId ? siteImages[siteId] : undefined
  const asset = slot && imageAsset(slot.src)
  if (!asset) return
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.setAttribute('imagesrcset', asset.srcset)
  link.setAttribute('imagesizes', '100vw')
  link.setAttribute('fetchpriority', 'high')
  document.head.append(link)
}
