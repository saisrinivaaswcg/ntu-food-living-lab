/**
 * Build-time image and video pipeline (vite-imagetools). Every photo dropped into public/images/ is resized to
 * WebP at several widths, with a ~24px blurred preview inlined for blur-up loading. Slots whose file
 * doesn't exist simply aren't in these maps, so the UI shows a placeholder without a failed request.
 */

export interface ImageAsset {
  /** Largest WebP */
  src: string
  srcset: string
  width: number
  height: number
  /** Tiny inline WebP, shown blurred until the photo loads */
  blur: string
}

interface ImgOutput {
  src: string
  srcset?: string
  w: number
  h: number
}

const GLOB_ROOT = '../../public'

const full = import.meta.glob<ImgOutput>('../../public/images/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
  query: { w: '480;640;800;1200;1800;2400', format: 'webp', quality: '62', as: 'img' },
})

const previews = import.meta.glob<ImgOutput>('../../public/images/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
  query: { w: '24', format: 'webp', quality: '40', inline: '', as: 'img' },
})

const assets = new Map<string, ImageAsset>(
  Object.entries(full).map(([path, img]) => [
    path.slice(GLOB_ROOT.length),
    {
      src: img.src,
      srcset: img.srcset ?? `${img.src} ${img.w}w`,
      width: img.w,
      height: img.h,
      blur: previews[path]?.src ?? '',
    },
  ]),
)

/** The processed image for a public path like "/images/sites/hall-12-herb-spice.jpg", if the file exists. */
export function imageAsset(publicPath: string): ImageAsset | undefined {
  return assets.get(publicPath)
}

const videos = import.meta.glob<string>('../../public/images/**/*.{mp4,webm}', {
  eager: true,
  import: 'default',
  query: '?url',
})

/** The bundled URL of a video slot like "/images/hero/explore-hero.mp4", if the file exists. */
export function videoAsset(publicPath: string): string | undefined {
  return videos[GLOB_ROOT + publicPath]
}
