# NTU Campus Food Systems Living Lab

Frontend prototype of a shared platform for NTU's campus and hall food-growing sites, so growing data is recorded the same way at every site, knowledge survives student-committee handovers, and students can learn to grow, join a garden community and compete hall against hall.

**Full product spec: `docs/SPEC.md`.** Read the section for a page before building or changing it.

## Commands

- `npm run dev` — dev server at http://localhost:5173 (also exposed on the LAN for phone testing)
- `npm run build` — type-check (`tsc -b`) and production build. Must pass before a task is done.
- `npm run lint` — oxlint

## Stack

React 19 + TypeScript (strict) + Vite · Tailwind CSS v4 (CSS-first config in `src/index.css`; there is no tailwind.config) · React Router v7 · Recharts · Leaflet + react-leaflet + OneMap (SLA) and Esri World Imagery basemap tiles · lucide-react · motion · qrcode-generator (bed QR cards, showcase QR).
No backend, no real auth, no database: everything a visitor does is saved in this browser's localStorage. "Logging in" is demo role switching that anyone can use.

## Architecture

- `src/types/index.ts` — the domain model. All four sites log into the same four record types: `PlantingLog`, `HarvestLog`, `WeeklyInputLog`, `FailureLog` (shown as “Plant losses”: lost of N in a bed, with recovered plants added back).
- `src/data/` — ALL mock data. Import data only from `src/data/index.ts`, never from the individual files, so the folder can be swapped for real data without touching pages.
- `src/lib/logStore.ts` — merges read-only demo logs with the user's submissions, demo-record edits/deletions and site setups (all in localStorage). Forms call `addLog(kind, record)`; `updateLog` / `deleteLog` (returns an undo) / `resetDemoRecord` edit any entry; `saveSiteSetup` / `resetSiteSetup` for Beds & plants; `setShowDemoData` toggles demo records. Current sites (with edited beds) come from `src/lib/siteRegistry.ts`, kept up to date by the store.
- `src/lib/communityStore.ts` — everything that isn't a log, in localStorage under its own key: the demo role, the student profile, join requests (Interest inbox), site community profiles, help-wanted tasks and claims, new-site requests, committee-added crops, competition settings and handovers. `useCommunity()` (`src/hooks/useCommunity.ts`) returns it live. Admin's "Reset demo data" clears both stores.
- `src/lib/roles.ts` — role helpers: `canEditSite(role, siteId)`, `isAdmin(role)` etc. Hide controls a role can't use instead of disabling them.
- `src/hooks/useLogs.ts` — `useLogs()` returns live logs. Components using it re-render the moment a log is saved, which is how the dashboard updates immediately.
- `src/lib/lookups.ts` — `getSite`, `findSite` (for URL params), `getCrop`, `getBed`, `cropName`, `siteName`.
- Derived numbers (KPIs, completeness, survival, efficiency, cost per kg, leaderboard) go in `src/lib/metrics.ts` as pure functions over `LogCollections`, not inside components. Definitions are in `docs/SPEC.md` → Metric definitions.
- `src/pages/` — one file per route (`src/pages/workspace/` for the committee workspace). `src/components/{layout,ui,access,explore,log,dashboard,sites,learn,community,workspace,illustrations}/` — one component per file. Illustrations are hand-drawn-style line SVGs drawn in code (1.75 stroke, round caps), not icon-library glyphs. Learn's growth stages are SVG built from shared parts (stem, leaf, fruit, soil line) with per-crop variations, in `src/components/learn/`; crop data and care guides stay in `src/data/crops.ts`.
- Two layouts: the public side (`AppShell`: editorial, image-led, top nav + phone tab bar) and the committee workspace (`WorkspaceShell`: denser, sidebar). `/live` has no shell.

## Build order and status

1. [x] Project structure, types, mock data, log store
2. [x] Explore — app shell (top nav + mobile bottom nav, breadcrumbs, demo-data banner), Leaflet map, site side panel
3. [x] Log — four forms, harvest form first
4. [x] Dashboard
5. [x] Sites — Knowledge and Handover sections
6. [x] Access and demo roles — `/login`, "Viewing as" pill, role store
7. [x] Two sides — public shell and committee workspace with sidebar; old URLs redirect
8. [x] Learn to grow — `/learn`, `/learn/:cropId` scroll journeys (scroll-craft rules; working files in `docs/scrollcraft/`)
9. [x] Join a community — `/join`, `/join/:siteId`, My gardens
10. [x] Get involved — help wanted, ready to pick, bed pages, printable QR cards
11. [x] Hall Garden Cup — `/hall-cup`, demo hall sites, spotlight challenges
12. [x] New hall sites — start-a-garden guide, request, Admin approval
13. [ ] Committee tools — manage site, grow more, handover wizard, impact report
14. [ ] Engaging demo — guided tour, showcase mode, `/live` board

Tick items here when a step is finished. Remove the `.gitkeep` from a folder once it has real files.

## Routes

Full route map with roles: `docs/SPEC.md` → Routes and roles. In short:

- **Public** (no login needed): `/` Explore · `/sites` · `/sites/:siteId` · `/bed/:siteId/:bedId` · `/learn` · `/learn/:cropId` · `/join` · `/join/:siteId` · `/get-involved` · `/hall-cup` · `/start-a-garden` · `/start-a-garden/request` · `/my-gardens` · `/login` · `/credits`.
- **Committee workspace**: `/workspace` · `/workspace/log` · `/workspace/log/:kind` (`harvest`, `planting`, `weekly`, `losses`; `failure` redirects) · `/workspace/dashboard` · `/workspace/dashboard/harvest` · `/workspace/dashboard/planting` (period and site filters in the query string) · `/workspace/sites/:siteId/{manage,tasks,inbox,handover,impact,grow,qr}` · Admin only: `/workspace/approvals`, `/workspace/competition`.
- **Bare**: `/live` (big-screen board). `?showcase=1` on any page turns on showcase mode.
- Old URLs redirect: `/log/*` → `/workspace/log/*`, `/dashboard/*` → `/workspace/dashboard/*`, `/sites/:id?tab=handover` → `/workspace/sites/:id/handover`.

Unknown routes and unknown site IDs show a not-found page with a way back. Hidden helper: `/?editPins=1` makes the map pins draggable and shows their coordinates with Copy buttons (nothing is saved; paste the values into `src/data/sites.ts`).

## Non-negotiable rules

- Everything interactive works. No dead buttons, no `href="#"`, no "coming soon".
- Every list, chart and table has an empty state (e.g. a site with no logs, a search with no results).
- Breadcrumbs on every page below the top level.
- Demo data is always labelled as demonstration data in the UI (`DEMO_DATA_NOTICE`; records carry `source: 'demo'`).
- Controlled vocabulary: site, bed, crop, destination, propagation, compost type and cause are selects or buttons fed from `src/data` (beds from the current site setup). Free text only in notes/description fields, and in bed names in site setup.
- **Allowed:** demo roles (Visitor, Student, Committee member, Admin) that anyone can switch between, with no real security and a visible "Demo login" note; a local student profile created when someone joins a community; learning guides (Learn to grow); a hall-level competition (Hall Garden Cup) where teams, not individuals, are ranked. Editing a site's beds, bed areas, crops and plant counts is **site setup**, not inventory tracking; so is editing or deleting log entries.
- **Still NOT allowed:** individual points or scores, badges, quizzes, notifications, real user accounts or authentication, inventory tracking, gamified virtual gardens.
- No AI-generated images. Crop close-ups are freely licensed photos (Wikimedia Commons CC0 / CC BY / CC BY-SA, Unsplash, Pexels) with author, source URL and licence recorded in `src/data/images.ts` and shown on `/credits`; otherwise the SVG illustration. Never images of real NTU people.

## Design

- Clean university dashboard: green and white, rounded cards (`rounded-card`), subtle shadows (`shadow-card`), clear typography.
- Use the theme tokens in `src/index.css` (`brand-50…900`, `ink`, `ink-muted`, `ink-subtle`, `canvas`, `surface`, `line`, `demo`, `demo-bg`). Don't hard-code hex colours in components.
- Mobile-first. Harvest logging happens outdoors on a phone: touch targets at least 48px, inputs 16px or larger, primary action reachable with a thumb, no horizontal scroll at 360px wide.
- Lucide icons get `aria-hidden` when decorative. Every input has a visible label.
- Motion: animate only `transform` and `opacity`; every animation stops when reduced motion is on (`MotionConfig reducedMotion="user"`, plus the CSS rule in `index.css`). Scroll-driven pages must stay smooth on a phone.
- Hide what a role can't use (no disabled dead ends). A page a role can't open shows a one-click role switch, never a bare "access denied".

## Conventions

- TypeScript strict, no `any`. Reuse types from `src/types` instead of redefining shapes.
- Wrap every localStorage read and write in try/catch (see `logStore.ts`). Storage can be full, blocked or empty.
- Dates are ISO strings (`YYYY-MM-DD`); weeks start on Monday. Demo logs cover 13 Jul – 14 Oct 2026 (`DEMO_DATA_PERIOD`). Default dashboard periods anchor on the latest logged date, not `new Date()`, so demo charts still look right after Oct 2026.
- Site and hero photos live in `public/images/` (slots listed in `src/data/images.ts`). That folder is NOT Vite's raw public dir: photos go through vite-imagetools (resized WebP + blur-up preview, `src/data/imageAssets.ts`). Files to copy as-is (favicon) go in `static/` (`publicDir`).
- Photos logged in forms: compress in the browser (canvas, longest side ≈1024px, JPEG quality ≈0.7) before storing as a data URL. localStorage holds about 5 MB.
- Leaflet: import `leaflet/dist/leaflet.css` once (in `SiteMap.tsx`, so it ships with the lazily loaded map chunk); use `L.divIcon` or fix the default marker icon paths, because Vite breaks Leaflet's default icon URLs.
- Run `npm run build` after each change set and fix every type error before finishing.
