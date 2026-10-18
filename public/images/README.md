# Image slots

Drop files here with these exact names. Anything missing shows a labelled gradient placeholder.
The list of slots (paths, alt text, crop focus) lives in `src/data/images.ts`.

| File | Size (px) | Ratio | Format | Max file size | Shown on |
| --- | --- | --- | --- | --- | --- |
| `hero/explore-hero.jpg` | 2400 × 1350 | 16:9 | JPEG, quality ~75 | 450 KB | Explore hero, full width (cropped to portrait on phones, so keep the subject near the centre) |
| `hero/explore-hero.mp4` *(optional)* | 1920 × 1080 | 16:9 | H.264 MP4, no audio track, 6–10 s seamless loop | 4 MB | Plays muted behind the Explore headline; the JPEG above is its poster and its stand-in when motion is reduced |
| `sites/yunnan-culinary-trail.jpg` | 1600 × 1200 | 4:3 | JPEG, quality ~75 | 350 KB | Site cards, map panel, site page |
| `sites/hall-12-herb-spice.jpg` | 1600 × 1200 | 4:3 | JPEG, quality ~75 | 350 KB | 〃 |
| `sites/earthlink-yunnan-corner.jpg` | 1600 × 1200 | 4:3 | JPEG, quality ~75 | 350 KB | 〃 |
| `sites/community-herb-garden.jpg` | 1600 × 1200 | 4:3 | JPEG, quality ~75 | 350 KB | 〃 |

Use photos you have the rights to publish, and strip location metadata (EXIF GPS) before adding them.
To change a crop, set `focus` in `src/data/images.ts` (any CSS `object-position`, e.g. `'center 30%'`).
