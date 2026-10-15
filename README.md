# NTU Campus Food Systems Living Lab — prototype

A shared platform for four NTU food-growing sites, so growing data is recorded the same way everywhere and knowledge survives committee handovers.

**Stack:** React 19 + TypeScript + Vite · Tailwind CSS v4 · Recharts · Leaflet + OpenStreetMap · Lucide icons · React Router.
No backend: demo data lives in `src/data/`, and new submissions are saved in the browser (localStorage).

## Run it

Needs Node.js 20.19+ or 22.12+ (`node -v` to check).

```bash
cd ~/Documents/ntu-food-living-lab
npm install        # first time only
npm run dev        # opens on http://localhost:5173
```

**Test on your phone:** `npm run dev` also prints a `Network:` address (e.g. `http://192.168.1.23:5173`). Open it on a phone on the same Wi-Fi.

Other commands: `npm run build` (type-check + production build), `npm run preview` (serve the build), `npm run lint`.

## Folder structure

```
CLAUDE.md                 Instructions Claude Code loads automatically in this folder
docs/SPEC.md              Full product spec + metric definitions
src/
├── types/index.ts        Domain model: sites, crops, the 4 log types, knowledge, handovers
├── data/                 ALL mock data — swap this folder for real data later
│   ├── index.ts          Single entry point; pages import only from here
│   ├── sites.ts          The 4 sites, coordinates, beds
│   ├── crops.ts          Controlled crop list (the only crops the forms accept)
│   ├── vocabulary.ts     Dropdown options + labels (destinations, causes, compost…)
│   ├── plantings.ts      Demo planting logs
│   ├── harvests.ts       Demo harvest logs (~3 months)
│   ├── weeklyInputs.ts   Demo weekly water/compost/labour logs (gaps = missed weeks)
│   ├── failures.ts       Demo failure logs
│   ├── knowledge.ts      Crop notes + problem log per site
│   ├── protocols.ts      Shared protocols (food safety, harvest handling, pest response)
│   ├── handovers.ts      Handover records (2–3 per site) + checklist template
│   └── prices.ts         Supermarket prices + campus cost assumptions
├── lib/
│   ├── logStore.ts       Merges demo logs with localStorage submissions; live updates
│   └── lookups.ts        getSite(), cropName() and similar helpers
├── hooks/useLogs.ts      React hook — any component using it re-renders on a new log
├── pages/                One file per route (Explore, Log, Dashboard, Sites…)
└── components/
    ├── layout/           App shell, nav, breadcrumbs, demo-data banner
    ├── ui/               Shared building blocks (Card, Button, EmptyState…)
    ├── explore/          Map + site side panel
    ├── log/              The four forms
    ├── dashboard/        KPI cards, charts, tables, leaderboard
    └── sites/            Knowledge + handover sections
```

## Swapping in real data

Keep the export names and shapes in `src/data/index.ts` and change where the arrays come from (a JSON export, a spreadsheet converted to JSON, or an API call). Nothing outside `src/data/` needs to change.

## Demo data

Every log, person, contact and price in `src/data/` is invented for the prototype and labelled as demonstration data in the UI. Site coordinates are approximate — confirm each pin on site.
