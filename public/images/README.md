# Image slots

Drop files here with these exact names. Anything missing shows a labelled gradient placeholder.
At build time each photo is resized to WebP at several widths (480–2400 px, never upscaled) with a tiny blurred
preview for blur-up loading (vite-imagetools, `src/data/imageAssets.ts`). Give the largest size you have; JPEG or PNG.
After adding a file while `npm run dev` is running, reload the page.
The list of slots (paths, alt text, crop focus) lives in `src/data/images.ts`.

| File | Size (px) | Ratio | Format | Max file size | Shown on |
| --- | --- | --- | --- | --- | --- |
| `hero/explore-hero.jpg` | 2400 × 1350 | 16:9 | JPEG, quality ~75 | 450 KB | Explore hero, full width (cropped to portrait on phones, so keep the subject near the centre) |
| `hero/explore-hero.mp4` *(optional)* | 1920 × 1080 | 16:9 | H.264 MP4, no audio track, 6–10 s seamless loop | 4 MB | Plays muted behind the Explore headline; the JPEG above is its poster and its stand-in when motion is reduced |
| `sites/yunnan-culinary-trail.jpg` | 1600 × 1200 | 4:3 | JPEG, quality ~75 | 350 KB | Site cards, map panel, site page |
| `sites/hall-12-herb-spice.jpg` | 1600 × 1200 | 4:3 | JPEG, quality ~75 | 350 KB | 〃 |
| `sites/earthlink-yunnan-corner.jpg` | 1600 × 1200 | 4:3 | JPEG, quality ~75 | 350 KB | 〃 |
| `sites/community-herb-garden.jpg` | 1600 × 1200 | 4:3 | JPEG, quality ~75 | 350 KB | 〃 |
| `log/harvest.jpg`, `log/planting.jpg`, `log/weekly.jpg`, `log/losses.jpg` | 1600 × 1200 or larger | 4:3 (weekly may be portrait) | JPEG | 400 KB | Log page form choices |
| `dashboard/gallery-empty.jpg` | 1600 × 1200 | 4:3 | JPEG | 400 KB | Harvest dashboard, when there are no harvest photos |

Use photos you have the rights to publish, and strip location metadata (EXIF GPS) before adding them.
To change a crop, set `focus` in `src/data/images.ts` (any CSS `object-position`, e.g. `'center 30%'`).

## Current photos

The files here now are freely licensed photos from Wikimedia Commons (CC BY-SA). Their source, author and licence are
recorded in `src/data/images.ts` (`credit`) and listed on the Photo credits page (`/credits`). Site photos are marked
`representative: true`, because no free photo of the growing beds themselves exists. When you replace a file with
your own photo, keep the name and set that slot's `credit` (and `representative`) to match.
