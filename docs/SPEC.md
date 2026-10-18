# Product spec — NTU Campus Food Systems Living Lab

A shared platform connecting four campus food-growing sites so that growing data is recorded consistently and knowledge persists across student committees. Frontend prototype only: mock data in `src/data/`, submissions in localStorage.

## Sites

Real NTU locations, approximate coordinates (in `src/data/sites.ts`; confirm pins on site):

- Yunnan Garden Culinary Trail
- Hall 12 Herb & Spice Garden
- Earthlink's Yunnan Corner
- NTU Community Herb Garden

Crops (controlled list): Thai basil, mint, lemongrass, pandan, chilli padi, turmeric, kangkong.

---

## 1. Explore (`/`)

- Leaflet map of the NTU campus with a Map / Satellite toggle: OneMap Default HD tiles from the Singapore Land Authority (OneMap logo and attribution visible, as their terms of use require) and Esri World Imagery (with "Powered by Esri" and its source credit) with the four sites as markers. Marker colour reflects site status.
- Clicking a marker opens a side panel (desktop: right-hand panel; mobile: bottom sheet) with: site name, photo placeholder (labelled, uses `photoAlt`), status badge + status note, number of beds, crops currently growing, and a **View site** button → `/sites/:siteId`.
- "Crops currently growing" = for each bed, the crop of its most recent planting, unless a failure on that bed wiped out all plants since then. Show as chips.
- A list of the four sites under or beside the map, so the page works without using the map (keyboard and screen-reader friendly). Selecting a site in the list opens the same panel and pans the map.
- Panel can be closed (close button + Escape).

## 2. Log (`/log`, `/log/:kind`)

Four forms with an identical structure across sites. Site and crop are always dropdowns/buttons (controlled vocabulary); free text only in description/notes fields. Submissions save to localStorage via `addLog` and appear immediately on the Dashboard.

| Form | Fields |
| --- | --- |
| **Harvest** (priority) | site, bed, crop, weight (kg), destination (pantry / members / food bank / compost), labour hours, photo (**required**), notes (optional) |
| Planting | site, bed, crop, date, quantity, propagation type (seed / cutting / seedling), notes |
| Weekly inputs | site, week (Monday; defaults to current week), water (L), compost type + amount (kg), labour hours, notes |
| Plant losses (`/log/losses`; was “Failure”) | site, bed, crop, date, cause (pest / disease / drought / unknown), plants lost **out of** plants in the bed (pre-filled from the bed's current count), recovered plants (optional, added back), description, photo (optional). Shows the plants remaining. A partial event, not a site failure. |

### Harvest form — must be completable in under 60 seconds on a phone

- `/log` opens with Harvest as the large primary option; the other three are secondary.
- Remember the last-used site on this device (localStorage) and preselect it.
- Bed list filters to the chosen site. Choosing a bed auto-fills the crop from that bed's current planting (still editable).
- Date defaults to today and stays collapsed ("Today · change") unless tapped.
- Weight: large input with `inputMode="decimal"`, plus − / + steppers (0.05 kg).
- Destination: four large buttons, not a dropdown. Labour: quick chips (0.25, 0.5, 0.75, 1, 1.5, 2 h).
- Photo: one large "Take photo" button using `<input type="file" accept="image/*" capture="environment">`, shows a thumbnail, compressed before saving. Required — the submit button explains what's missing.
- Sticky full-width Save button at the bottom. Inline validation, no blocking alerts.
- After saving: confirmation with a summary, **Undo** (calls `removeUserLog`), **Log another harvest** (keeps site), and **View dashboard**.
- No page-level scrolling needed on a 390×844 phone except to reach notes.

## 3. Dashboard (`/dashboard`) — public, open to anyone

Controls: period (last 4 weeks / last 3 months / all), site filter (all or one), demo-data toggle. Every block shows an empty state when there is no data.

- **KPI cards:** total harvest (kg), crop types grown, water used (L), labour hours, kg per labour hour.
- **Data completeness score — prominent, near the top**, e.g. "68% of weeks logged this month", with a per-site breakdown. Never hidden behind a click.
- **Charts:** harvest over time (line, weekly kg), harvest by crop (bar), water use over time (line, weekly L).
- **Efficiency table:** kg per litre and kg per labour hour by crop, sortable by any column.
- **Cost comparison table:** campus cost per kg vs supermarket price per kg (imported and local) by crop, with the difference. Show the assumptions (`costAssumptions`) and the price survey date.
- **Site comparison view:** the four sites side by side — kg, kg per m², water, kg per litre, labour hours, completeness, survival rate.
- **CSV export** of the raw harvest log (respects the current filters): `id, date, site, bed, crop, weight_kg, destination, labour_hours, has_photo, notes, source`. Photos are not exported.
- **Inter-hall challenge leaderboard:** ranks sites on a blended score, not yield alone. Show each component so the ranking is transparent.

### Harvest and Planting dashboards (`/dashboard/harvest`, `/dashboard/planting`)

Tabs beside the Overview (`/dashboard`). Period and site filters are shared through the URL.

- **Harvest:** headline (total kg, number of harvests, kg per m², top crop); kg per week by site (small multiples on a shared scale); kg by crop; where the harvest went (destination); a gallery of harvest photos (select to enlarge); a sortable recent-harvests table with photo thumbnails; CSV export.
- **Planting:** headline (plants in the ground now, plantings this period, survival rate, beds in use); a bed-by-bed view per site of what is growing now; plantings per week; survival rate by crop; propagation method breakdown; median days from planting to first harvest by crop against the crop's typical days; expected upcoming first harvests; losses by cause; a sortable recent-plantings table; CSV export (`id, date, site, bed, crop, quantity, propagation, notes, source`).
- Every chart has an empty state, a "what this shows" line and a source line with the demo-data note.

## 4. Sites (`/sites`, `/sites/:siteId`)

`/sites` lists the four sites as cards. Each site page has two tabs:

### Knowledge
- **Crop cards** — what grew here, yield range (computed from that site's harvest logs: per-harvest min–max kg and total kg), problems hit, what fixed them (from `cropNotes`). Crops with harvests but no notes still get a card.
- **Problem log** — searchable (title, symptoms, action, tags) and filterable by crop, cause and status (open/resolved).
- **Shared protocols** — food safety, harvest handling, pest response (`protocols`), shown as expandable sections.

### Handover
- From the latest handover record: current leads (incoming leads), site status, open issues (by priority), contacts, lessons learnt.
- **Handover checklist** — interactive; ticks persist in localStorage per handover record, with a progress count.
- **History** — previous handover records stay visible as a list (newest first), each expandable to show its full details.

---

### Editing and site setup

- **Recent entries** on the Log page: every record (harvest, planting, weekly inputs, losses) can be edited or deleted (with Undo). Demo records are changed through overrides on this device, with Reset per entry and for all. Edited entries show an “Edited” marker. Dashboards update immediately.
- **Beds & plants** on each site page (site setup, not inventory tracking): add or remove beds, edit each bed's name and area (m²), and set the crop and plant count in each bed. Saved on this device as overrides with “Reset to original values”. A site's area becomes the sum of its bed areas; a bed's crop and plant count become a setup record dated at the latest log, so beds in use, plants in the ground, survival and kg per m² follow immediately. Setup records are not plantings: they are left out of planting activity, tables and CSV.

## Metric definitions

Put these in `src/lib/metrics.ts` as pure functions. All respect the dashboard's period and site filters.

- **Total harvest (kg):** sum of `weightKg` over harvest logs, including compost (show the composted share separately).
- **Crop types grown:** distinct crops with a planting or harvest in the period.
- **Water used (L):** sum of `waterLitres` over weekly input logs.
- **Labour hours:** harvest `labourHours` + weekly `labourHours`.
- **kg per labour hour:** total kg ÷ labour hours.
- **Data completeness:** a site-week is logged when a weekly-inputs record exists for that site and week. Score = logged site-weeks ÷ (sites × complete weeks in period). Headline period = last 4 complete weeks up to the anchor date. Weeks start Monday.
- **Survival rate (per site):** 1 − Σ net loss ÷ Σ planted `quantity`, where net loss = `estimatedLossPlants` − `recoveredPlants`.
- **Allocating site inputs to crops:** water, compost and weekly labour are logged per site per week. Split each site-week's inputs across crops in proportion to the number of beds each crop occupies that week (bed's crop = its latest planting on or before that week).
- **Efficiency by crop:** kg per litre = crop kg ÷ allocated water. kg per labour hour = crop kg ÷ (crop harvest labour + allocated weekly labour).
- **Campus cost per kg (by crop):** (allocated water × `waterPerLitre` + allocated compost kg × compost price + propagation units × unit cost + labour × `labourPerHour`) ÷ crop kg. Volunteer labour is excluded by default (`labourPerHour = 0`).
- **Leaderboard blended score (0–100):** equal weights (25% each) of four components, each scaled 0–100 relative to the best site (value ÷ best value × 100):
  1. yield — kg per m² of growing area (`areaSqm`), so small sites aren't penalised
  2. data completeness
  3. survival rate
  4. kg per litre
  Keep the weights in one exported constant so the committee can change them.

## Demo data

- Every log, person, contact and price is invented and must be labelled as demonstration data in the UI. Real site names and approximate locations only.
- Period: 13 Jul – 14 Oct 2026. Includes varied planting dates, ~3 months of harvests, a few failures (incl. a drought loss at Yunnan Corner), weeks with missing logs, and 2–3 handover records per site.

## Out of scope

User accounts, authentication, notifications, inventory tracking, quizzes, badges, gamified virtual gardens, any backend.
