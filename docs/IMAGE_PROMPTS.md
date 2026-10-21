# AI illustration prompts

Sixteen illustration slots, made by the project team in ChatGPT or Gemini. Every slot is wired in `src/data/images.ts` (`illustrations`, with `kind: 'illustration'`, `aiGenerated: true`, credit "AI illustration"). It appears in the app as soon as its file is in place.

## How to add one

1. Generate the image with the prompt below. Every prompt starts with the shared style line, so the set matches.
2. Save it as **PNG or JPG** with the exact file name below. The extension doesn't matter: `basil.png`, `basil.jpg`, `basil.jpeg` and `basil.webp` all work.
3. Put it in the folder shown, under `public/images/illustrations/`.
4. Run `npm run dev` or `npm run build`. The pipeline (vite-imagetools) resizes it to WebP at several widths and adds a blur-up preview. You don't need to resize it yourself, but stay at or above the size listed.
5. If the file is missing or fails to load, the page falls back to the SVG drawing (crop plates), the plain empty-state icon, or the text-only header. You never get a broken image.

Rules for every image: no text or lettering, no people's faces, no real NTU buildings, no logos. Each one shows on `/credits` once its file exists.

**Shared style line** (already at the start of every prompt below):

> Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces.

---

## Crop plates on /learn (7)

Shown at the top of each crop's specimen plate on `/learn`, in place of the SVG drawing. The frame is 4:5 and the image is cropped to fill it, so keep the whole plant inside the central 80%.

| Slot | File | Size | Aspect |
| --- | --- | --- | --- |
| Thai basil | `public/images/illustrations/learn/basil.png` | 1600 × 2000 px | 4:5 portrait |
| Mint | `public/images/illustrations/learn/mint.png` | 1600 × 2000 px | 4:5 portrait |
| Lemongrass | `public/images/illustrations/learn/lemongrass.png` | 1600 × 2000 px | 4:5 portrait |
| Pandan | `public/images/illustrations/learn/pandan.png` | 1600 × 2000 px | 4:5 portrait |
| Chilli padi | `public/images/illustrations/learn/chilli-padi.png` | 1600 × 2000 px | 4:5 portrait |
| Turmeric | `public/images/illustrations/learn/turmeric.png` | 1600 × 2000 px | 4:5 portrait |
| Kangkong | `public/images/illustrations/learn/kangkong.png` | 1600 × 2000 px | 4:5 portrait |

**basil.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A single mature Thai basil plant (Ocimum basilicum var. thyrsiflora) as a botanical specimen plate, upright and bushy, glossy oval leaves in opposite pairs, purple stems and tight purple flower spikes at the tips, a little soil line at the base, centred with generous margins, portrait 4:5.
```

**mint.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A spreading mint plant (Mentha) as a botanical specimen plate, square stems, crinkled serrated leaves in pairs, a few runners creeping sideways along the soil line with small roots, centred with generous margins, portrait 4:5.
```

**lemongrass.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A lemongrass clump (Cymbopogon citratus) as a botanical specimen plate, tall arching blue-green grassy leaves rising from thick pale cream stalks with a faint terracotta blush at the base, fibrous roots below the soil line, centred with generous margins, portrait 4:5.
```

**pandan.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A pandan plant (Pandanus amaryllifolius) as a botanical specimen plate, a spiral rosette of long narrow glossy blade-like leaves fanning out from a short stem, a couple of aerial prop roots touching the soil line, centred with generous margins, portrait 4:5.
```

**chilli-padi.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A chilli padi shrub (Capsicum frutescens) as a botanical specimen plate, small pointed leaves, a few tiny white flowers, and many small upright chillies, some green and most ripe terracotta-red, a thin stake beside it, centred with generous margins, portrait 4:5.
```

**turmeric.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A turmeric plant (Curcuma longa) as a botanical specimen plate, a few large broad lance-shaped leaves on long stalks above the soil line, and below it a cutaway showing knobbly rhizomes in warm orange with one cut open, centred with generous margins, portrait 4:5.
```

**kangkong.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. Kangkong, water spinach (Ipomoea aquatica), as a botanical specimen plate, hollow trailing stems with arrow-shaped leaves, one pale funnel-shaped flower, stems arching over a shallow soil line with roots at the nodes, centred with generous margins, portrait 4:5.
```

---

## Page headers (5)

Shown beside the page title on desktop and above it on phones, uncropped (the whole picture shows). Not shown at all until the file exists.

| Slot | File | Size | Aspect | Used on |
| --- | --- | --- | --- | --- |
| Learn header | `public/images/illustrations/hero/learn.png` | 1600 × 1200 px | 4:3 landscape | `/learn` |
| Join header | `public/images/illustrations/hero/join.png` | 1600 × 1200 px | 4:3 landscape | `/join` |
| Hall Cup header | `public/images/illustrations/hero/hall-cup.png` | 1600 × 1200 px | 4:3 landscape | `/hall-cup` |
| Get involved header | `public/images/illustrations/hero/get-involved.png` | 1600 × 1200 px | 4:3 landscape | `/get-involved` |
| Start a hall garden header | `public/images/illustrations/hero/start-a-garden.png` | 1600 × 1200 px | 4:3 landscape | `/start-a-garden` |

**hero/learn.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A row of five terracotta pots on a wooden shelf showing one herb from seed to harvest: a seed in soil, a sprout with two seed leaves, a young plant, a bushy plant, and a full plant with a few cut stems beside it, landscape 4:3, plenty of empty background around the shelf.
```

**hero/join.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A welcoming community garden corner: a raised timber herb bed with basil, mint and chilli, a pair of gardening gloves, a watering can, a trowel and a few extra pairs of gloves hung on a hook as if waiting for newcomers, landscape 4:3, no buildings.
```

**hero/hall-cup.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A large two-handled trophy cup made of terracotta, used as a planter and overflowing with herbs (basil, mint, lemongrass blades, a sprig of chilli padi), standing on a simple wooden plinth, a few scattered leaves around it, landscape 4:3.
```

**hero/get-involved.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A potting bench seen from the front: a woven harvest basket with freshly cut herbs and chillies, a pair of secateurs, a blank paper calendar card pinned to the bench with one day circled in terracotta, a small watering can, landscape 4:3.
```

**hero/start-a-garden.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A plain concrete ledge along a generic covered walkway turned into a garden: three wooden planter boxes with young herbs, a bag of potting mix, a trowel and a watering can, simple railings and a hint of sky, no recognisable building, landscape 4:3.
```

---

## Empty states (4)

Small pictures (about 6 rem, shown uncropped) beside the "nothing here yet" messages. Until the file exists, the plain empty-state icon shows.

| Slot | File | Size | Aspect | Used on |
| --- | --- | --- | --- | --- |
| No tasks | `public/images/illustrations/empty/no-tasks.png` | 800 × 800 px | 1:1 square | Get involved and Join pages when no task matches |
| Nothing ready | `public/images/illustrations/empty/nothing-ready.png` | 800 × 800 px | 1:1 square | Get involved → Ready to pick, when nothing is ready |
| No gardens joined | `public/images/illustrations/empty/no-gardens.png` | 800 × 800 px | 1:1 square | My gardens, before joining anything |
| Page not found | `public/images/illustrations/empty/not-found.png` | 800 × 800 px | 1:1 square | Not-found page (replaces the compass icon) |

**empty/no-tasks.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A small wooden clipboard with a blank sheet leaning against a terracotta pot with a single sprig of mint, a pencil beside it, simple and centred, square 1:1, lots of empty background.
```

**empty/nothing-ready.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A single small seedling with two leaves in a terracotta pot, clearly not ready to harvest yet, a tiny watering can beside it, simple and centred, square 1:1, lots of empty background.
```

**empty/no-gardens.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. An empty seed tray filled with soil, a small seed packet with no writing on it and a few seeds spilling out, simple and centred, square 1:1, lots of empty background.
```

**empty/not-found.png**
```
Botanical hand-drawn illustration, fine ink lines with soft watercolour wash, warm off-white background, muted greens with a terracotta accent, no text, no people's faces. A narrow garden path of stepping stones that ends at a small closed wooden gate between two herb bushes, simple and centred, square 1:1, lots of empty background.
```
