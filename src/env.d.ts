/** True when the production build runs on Vercel (set in vite.config.ts). */
declare const __ON_VERCEL__: boolean

interface ImportMetaEnv {
  /** Public address printed on QR cards (e.g. https://ntu-food-living-lab.vercel.app). Defaults to the page's origin. */
  readonly VITE_PUBLIC_SITE_URL?: string
}
