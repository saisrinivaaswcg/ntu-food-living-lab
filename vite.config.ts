import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'

// https://vite.dev/config/
export default defineConfig({
  // imagetools: photos in public/images are served as resized WebP with tiny blur-up previews (src/data/imageAssets.ts).
  plugins: [react(), tailwindcss(), imagetools({ exclude: 'static/**/*' })],
  // Files copied as-is (favicon etc.) live in static/. public/images/ is NOT a raw folder: photos dropped
  // there go through imagetools and ship as resized WebP, so they must stay out of Vite's publicDir.
  publicDir: 'static',
  // Speed Insights only has its script on Vercel deployments; elsewhere it would just 404.
  define: { __ON_VERCEL__: JSON.stringify(Boolean(process.env.VERCEL)) },
  server: {
    // Lets you open the dev server on your phone (same Wi-Fi) to test harvest logging.
    host: true,
  },
})
