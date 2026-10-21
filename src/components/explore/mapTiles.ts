import L from 'leaflet'

/**
 * Two base layers, switched with the Map / Satellite toggle.
 *
 * Map: OneMap Default by the Singapore Land Authority (no API key), HD tiles with a per-tile fallback to the
 * standard tiles. The OneMap logo + credit is required by the OneMap terms of use — do not remove it.
 *
 * Satellite: Esri World Imagery (no key). "Powered by Esri" and the source credit (from the service's own
 * copyrightText) are required by Esri's attribution rules.
 */
export const ONEMAP_HD_TILES = 'https://www.onemap.gov.sg/maps/tiles/Default_HD/{z}/{x}/{y}.png'
export const onemapFallbackUrl = ({ x, y, z }: L.Coords) => `https://www.onemap.gov.sg/maps/tiles/Default/${z}/${x}/${y}.png`
export const ONEMAP_ATTRIBUTION =
  '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" alt="OneMap logo" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'

export const ESRI_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
export const ESRI_ATTRIBUTION =
  'Powered by <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> &#124; Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community'

/** OneMap's documented minimum. */
export const MIN_ZOOM = 11
/** Close enough to see individual beds. OneMap HD has tiles to 20; Esri imagery here stops at 19 and is scaled up. */
export const MAX_ZOOM = 20
export const ONEMAP_HD_MAX_NATIVE = 20
export const ESRI_MAX_NATIVE = 19
/** Singapore: south-west and north-east corners (from the OneMap docs) */
export const SINGAPORE_BOUNDS = L.latLngBounds([1.144, 103.535], [1.494, 104.502])

/** If an HD tile fails, load the standard OneMap tile in its place (once). */
export function fallBackToStandardTile(e: L.TileErrorEvent) {
  const tile = e.tile
  if (tile.dataset.fallback) return
  tile.dataset.fallback = '1'
  tile.src = onemapFallbackUrl(e.coords)
}

