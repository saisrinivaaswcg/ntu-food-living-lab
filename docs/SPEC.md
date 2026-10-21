# Product spec — NTU Campus Food Systems Living Lab

A shared platform connecting NTU's campus and hall food-growing sites so that growing data is recorded consistently, knowledge persists across student committees, students can learn to grow and join a garden community, and halls compete as teams in the Hall Garden Cup. Frontend prototype only: mock data in `src/data/`, everything a visitor does in localStorage. No backend, no real login.

## Routes and roles

### Roles (demo only)

Anyone can switch roles from `/login` or the header pill ("Viewing as: … · Switch"). A note says: "Demo login: anyone can switch roles. No real security." The role is stored in localStorage.

| Role | Who | Can do |
| --- | --- | --- |
| Visitor (default) | Anyone | Browse every public page: map, sites, beds, photos, what's growing, Learn, Join, Get involved, Hall Cup. Joining a community makes them a Student. |
| Student | Local profile (name, hall, contact, consent), created when they join a community. Demo: "Mei Tan, Hall 12". | Join communities, claim help-wanted slots, My gardens, request a new hall site. |
| Committee member | Picks a site; demo PIN pre-filled | Workspace for their own site: Log, Dashboards (own site by default, others read-only), Manage site, Help wanted, Interest inbox, Handover, Impact, Grow more, QR cards. Can request a new site. |
| Admin (NTU Sustainability Office) | Demo PIN pre-filled | Everything a committee member can do, for every site, plus Approve new sites, competition settings and Reset demo data. |

Controls a role can't use are hidden. A workspace page opened by the wrong role shows the role cards (one click to switch), not a dead end.

### Route map

**Public side** (editorial, image-led, scroll-driven):
`/` Explore · `/sites` · `/sites/:siteId` · `/bed/:siteId/:bedId` (QR target) · `/learn` · `/learn/:cropId` · `/join` · `/join/:siteId` · `/get-involved` · `/hall-cup` · `/start-a-garden` · `/start-a-garden/request` · `/my-gardens` (Student) · `/login` · `/credits`

**Committee workspace** (dense tool layout with a sidebar and a site switcher):
`/workspace` (today at your site) · `/workspace/log` · `/workspace/log/:kind` · `/workspace/dashboard` · `/workspace/dashboard/harvest` · `/workspace/dashboard/planting` · `/workspace/sites/:siteId/manage` · `/workspace/sites/:siteId/tasks` · `/workspace/sites/:siteId/inbox` · `/workspace/sites/:siteId/handover` (+ `/pack`, printable) · `/workspace/sites/:siteId/impact` · `/workspace/sites/:siteId/grow` · `/workspace/sites/:siteId/qr` · Admin: `/workspace/approvals` · `/workspace/competition`

**Bare:** `/live` big-screen board. `?showcase=1` on any page turns on showcase mode.

**Workspace home** (`/workspace`): quick log buttons, the last four weeks (weekly logs done, kg harvested, beds ready, last harvest), beds ready soon and weekly logs missing. Admin also sees every site's status and completeness, and **Reset demo data** (with a confirmation).

**Redirects:** `/log/*` → `/workspace/log/*` · `/dashboard/*` → `/workspace/dashboard/*` (query kept) · `/sites/:id?tab=handover` → `/workspace/sites/:id/handover` · `/log/failure` → `/workspace/log/losses`.

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

## 2. Log (`/workspace/log`, `/workspace/log/:kind`) — committee workspace

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

## 3. Dashboards (`/workspace/dashboard`) — committee workspace

A committee sees its own site by default and can switch the site filter to any other site (dashboards are read-only). Admin sees all sites.

Controls: period (last 4 weeks / last 3 months / all), site filter (all or one), demo-data toggle. Every block shows an empty state when there is no data.

- **KPI cards:** total harvest (kg), crop types grown, water used (L), labour hours, kg per labour hour.
- **Data completeness score — prominent, near the top**, e.g. "68% of weeks logged this month", with a per-site breakdown. Never hidden behind a click.
- **Charts:** harvest over time (line, weekly kg), harvest by crop (bar), water use over time (line, weekly L).
- **Efficiency table:** kg per litre and kg per labour hour by crop, sortable by any column.
- **Cost comparison table:** campus cost per kg vs supermarket price per kg (imported and local) by crop, with the difference. Show the assumptions (`costAssumptions`) and the price survey date.
- **Site comparison view:** the four sites side by side — kg, kg per m², water, kg per litre, labour hours, completeness, survival rate.
- **CSV export** of the raw harvest log (respects the current filters): `id, date, site, bed, crop, weight_kg, destination, labour_hours, has_photo, notes, source`. Photos are not exported.
- **Inter-hall challenge leaderboard:** ranks sites on a blended score, not yield alone. Show each component so the ranking is transparent.

### Harvest and Planting dashboards (`/workspace/dashboard/harvest`, `/workspace/dashboard/planting`)

Tabs beside the Overview (`/workspace/dashboard`). Period and site filters are shared through the URL.

- **Harvest:** headline (total kg, number of harvests, kg per m², top crop); kg per week by site (small multiples on a shared scale); kg by crop; where the harvest went (destination); a gallery of harvest photos (select to enlarge); a sortable recent-harvests table with photo thumbnails; CSV export.
- **Planting:** headline (plants in the ground now, plantings this period, survival rate, beds in use); a bed-by-bed view per site of what is growing now; plantings per week; survival rate by crop; propagation method breakdown; median days from planting to first harvest by crop against the crop's typical days; expected upcoming first harvests; losses by cause; a sortable recent-plantings table; CSV export (`id, date, site, bed, crop, quantity, propagation, notes, source`).
- Every chart has an empty state, a "what this shows" line and a source line with the demo-data note.

## 4. Sites (`/sites`, `/sites/:siteId`)

`/sites` lists the sites. Each public site page shows what's growing, the beds, the bed map, growth timelines and the site's Knowledge. Committee members of that site (and Admin) also see links to **Manage site** and **Handover** in the workspace.

### Knowledge
- **Crop cards** — what grew here, yield range (computed from that site's harvest logs: per-harvest min–max kg and total kg), problems hit, what fixed them (from `cropNotes`). Crops with harvests but no notes still get a card.
- **Problem log** — searchable (title, symptoms, action, tags) and filterable by crop, cause and status (open/resolved).
- **Shared protocols** — food safety, harvest handling, pest response (`protocols`), shown as expandable sections.

### Handover (`/workspace/sites/:siteId/handover`)
- From the latest handover record: current leads (incoming leads), site status, open issues (by priority), contacts, lessons learnt.
- **Handover checklist** — interactive; ticks persist in localStorage per handover record, with a progress count.
- **History** — previous handover records stay visible as a list (newest first), each expandable to show its full details.

## 5. Learn to grow (`/learn`, `/learn/:cropId`) — public

Built with the scroll-craft skill's rules (brief, grammar and verification in `docs/scrollcraft/builds/learn-to-grow/`), using `motion`, not its engine.

- **Crop library (`/learn`):** every crop as a specimen plate (drawn fully grown) with one label schema: name, botanical name, local name, days to first harvest, light, survival at NTU, beginner rating. Easiest first. An index of crop names at the top jumps to each plate.
- **Crop journey (`/learn/:cropId`):** a split stage that pins while you scroll. Left: the plant, drawn as SVG from shared parts (stem, leaf, blade, fruit, soil line, roots) with a per-crop form, grows from seed to harvest. Middle: a ruler of the crop's real days to first harvest, the day the drawing is at, and the five stages (Sow, Seedling, Growing, Ready, Harvest). Right: two or three practical steps per stage (`careGuide.steps`). Ready shows a real, credited photo of the crop when it's ready. At Harvest the split collapses: the steps leave, the plant moves to the centre, the harvest goes in a basket, and the **At NTU** numbers arrive as specimen tags tied to the plant (keyed with letters on phones).
- **At NTU** (pure functions in `metrics.ts`, `cropAtNtu`): survival (1 − net losses ÷ plants planted, all sites, all time), median days to first harvest, best site (most kg per plant planted, at least two harvests), and a beginner rating (Beginner-friendly / Some care needed / Takes patience) from survival, speed to first harvest and problems logged, with the reasons shown. Numbers appear; they never count up. Labelled as demonstration data.
- **What went wrong here** (`cropTroubles`): the crop's problem-log entries (with what was done and whether it's fixed) and plant-loss records ("3 of 20 plants lost", recovered), newest first. Beside it, **In Singapore's weather** (`careGuide.climate`).
- **Grow this with us:** beginner-friendly help-wanted sessions for this crop, or at sites growing it now, with spots left; NParks edible-gardening resources; and one closing action (meet the garden).
- Motion: transform and opacity only. One CSS custom property (`--grow`) drives every part of the drawing. With reduced motion nothing pins or moves: five still plates beside their steps, and the harvest plate with the tags.
- Crop chips on a site page link to that crop's guide.

## 6. Join a community (`/join`, `/join/:siteId`, `/my-gardens`) — public

- **`/join`:** the newcomer path (learn a crop → claim a beginner task → meet the committee) and every site's community: welcome, what it grows now, workdays, open roles, picking policy, "You asked to join" when joined.
- **`/join/:siteId`:** what the site grows, workdays and meeting point, open roles ("I'd like this role" pre-selects it), beginner tasks with **Claim a slot** (name pre-filled) and **Add to calendar** (.ics), and the **Join this community** form: name, hall (controlled list), preferred contact (email / Telegram / phone), role, optional note, consent (required), with a short privacy note. Joining creates or updates the Student profile, switches to Student, appears in the site's **Interest inbox** and on **My gardens**. Joining the same site again replaces the earlier request.
- **Community profile** (`SiteCommunity`): welcome, workdays, meeting point, open roles, pick policy. Edited by that site's committee (or Admin) in Manage site → Community; Reset to original values.
- **Interest inbox** (`/workspace/sites/:siteId/inbox`): requests newest first, filter by status, move New → Contacted → Welcomed (with Undo). Contact details show only with consent and only to that site's committee.
- **My gardens:** communities joined (status, role, next workday, leave with Undo), slots claimed (give back), and the profile (change, or delete everything from this device).

## 8. Get involved, bed pages and QR cards

- **`/get-involved`:** every upcoming help-wanted task (filter by garden, beginner-friendly only). **Claim a slot** with the name pre-filled from the student profile (one slot per name; full tasks say Full; give back with Undo) and **Add to calendar** (.ics, Asia/Singapore). **Ready to pick:** per site, beds at Ready or Harvesting stage (linking to bed pages) and the site's pick policy (Help yourself / Ask first / Committee picks).
- **Help wanted** (`/workspace/sites/:siteId/tasks`): the committee posts a task (title, detail, date, start–end slot, helpers needed, beginner-friendly, optional crop), sees who claimed each slot, and takes tasks down (Undo).
- **Bed page** (`/bed/:siteId/:bedId`, the QR target): crop, stage and progress, planted / plants / first harvest, the crop's three-line care card (`careGuide.quickCare`), pick policy when ready, and big **Log harvest** (harvest form pre-filled with site, bed, crop) and **Log watering** (weekly inputs form pre-filled with the site) buttons. Bed names on site pages link here.
- **QR cards** (`/workspace/sites/:siteId/qr`): one printable card per bed (site, bed, crop, first care line, QR to the bed page). Codes use `VITE_PUBLIC_SITE_URL` when set, else the page origin. Printing hides the workspace chrome.

## 9. New hall sites (`/start-a-garden`, `/start-a-garden/request`, Admin: `/workspace/approvals`)

- **Guide (public):** beginner crops ranked by survival at NTU (`cropAtNtu`, then days to first harvest), with plants needed for the chosen bed size; bed sizes (trough, planter box, three boxes, in-ground bed) with an indicative starter kit and total cost (`src/data/startGarden.ts`); six steps.
- **Request (Student, Committee, Admin):** hall (controlled list), garden name, description, map pin (tap the OneMap map or type coordinates; must be in Singapore), beds (name + m²), requester name, contact, optional photo (compressed). Saved as pending in the community store; the requester sees status and can withdraw a pending request.
- **Approvals (Admin):** each pending request with photo, pin (Open in OneMap), beds and contact; Approve or Decline with a note (Undo). An approved request becomes a site (status Establishing, beds as requested, `hall` set) that the log store adds to the site registry, so it appears on the map, Sites, Join and the Hall Garden Cup straight away.

## 7. Hall Garden Cup (`/hall-cup`, Admin: `/workspace/competition`)

- Every site has a `hall` (one of `src/data/halls.ts`, or "Campus"). Only hall sites compete, as teams. Three invented hall gardens (`src/data/hallSites.ts`, `fictional: true`, generated demo logs) are always tagged **Demo hall site**.
- **Semester ranking** (`CUP_SEMESTER`, standings to the latest logged date): score = 25% yield per m² + 15% survival + 15% water efficiency (kg/L) + 20% data completeness + 25% participation per m² ((people who asked to join this semester + task slots filled) ÷ m²). Weights in `HALL_CUP_WEIGHTS` (`metrics.ts`). Each component is scaled against the best hall (value ÷ best × 100), so small gardens can win. Each hall shows its components, points and a **Why this rank** note (strongest measure, where it lost most, gap to the team above).
- **Monthly spotlight:** one team challenge a month from a fixed list (`spotlightChallenges`), chosen by Admin on `/workspace/competition`; standings per month, winner/leading marked. It doesn't change the semester score.
- No individual points, scores or badges.

---

### Editing and site setup

- **Recent entries** on the Log page: every record (harvest, planting, weekly inputs, losses) can be edited or deleted (with Undo). Demo records are changed through overrides on this device, with Reset per entry and for all. Edited entries show an “Edited” marker. Dashboards update immediately.
- **Beds & plants** in the workspace's Manage site (`/workspace/sites/:siteId/manage`; site setup, not inventory tracking): add or remove beds, edit each bed's name and area (m²), and set the crop and plant count in each bed. Saved on this device as overrides with “Reset to original values”. A site's area becomes the sum of its bed areas; a bed's crop and plant count become a setup record dated at the latest log, so beds in use, plants in the ground, survival and kg per m² follow immediately. Setup records are not plantings: they are left out of planting activity, tables and CSV.

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

## Allowed and out of scope

Allowed: demo roles anyone can switch (no real security), a local student profile, learning guides, and a hall-level team competition (Hall Garden Cup).

Out of scope: individual points or scores, badges, quizzes, notifications, real user accounts or authentication, inventory tracking, gamified virtual gardens, any backend, AI-generated images.
