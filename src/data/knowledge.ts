import type { CropNote, ProblemEntry } from '../types'

/**
 * DEMONSTRATION DATA — site knowledge written by (fictional) committee members.
 * Yield ranges are NOT stored here; the Sites page computes them from harvest logs
 * so they always match the data.
 */

export const cropNotes: CropNote[] = [
  /* ---------------- Yunnan Garden Culinary Trail ---------------- */
  {
    siteId: 'yunnan-culinary-trail', cropId: 'basil',
    summary: 'Reliable weekly cropper in the full-sun beds. Goes woody after about four months, so we keep a succession bed going.',
    problems: ['Flower spikes appear quickly in hot spells and leaves turn bitter.', 'Plants become woody by month four.'],
    fixes: ['Pinch flower spikes at every harvest.', 'Start a new bed from seedlings every 10–12 weeks (Bed 6 started cropping in Oct 2026).'],
  },
  {
    siteId: 'yunnan-culinary-trail', cropId: 'lemongrass',
    summary: 'Very low effort. Harvest every three weeks from established clumps.',
    problems: ['Clumps in Bed 2 got congested and stalks thinned out.'],
    fixes: ['Divide clumps every 6–8 months and replant the outer pieces.'],
  },
  {
    siteId: 'yunnan-culinary-trail', cropId: 'pandan',
    summary: 'Thrives in the part-shade bed. Popular with the pantry for kuih and drinks.',
    problems: ['Leaf tips brown when the bed dries out.'],
    fixes: ['Mulch with leaf litter and water twice a week in dry spells.'],
  },
  {
    siteId: 'yunnan-culinary-trail', cropId: 'turmeric',
    summary: 'Slow (about eight months) but gives the biggest single harvests on the trail.',
    problems: ['Hard to tell when it is ready.'],
    fixes: ['Lift when most leaves have yellowed and dried. Keep a few rhizomes back as next season’s planting stock.'],
    tips: ['Lift in sections over three weekends rather than all at once, so the pantry is not swamped.'],
  },
  {
    siteId: 'yunnan-culinary-trail', cropId: 'chilli-padi',
    summary: 'Started fruiting in September. Small, steady pickings.',
    problems: ['Fruit rot with dark sunken spots after wet weeks (likely anthracnose).'],
    fixes: ['Remove affected fruit and plants promptly; avoid wetting fruit when watering.'],
  },

  /* ---------------- Hall 12 Herb & Spice Garden ---------------- */
  {
    siteId: 'hall-12-herb-spice', cropId: 'basil',
    summary: 'Good yields from a single planter box, but very exposed to caterpillars.',
    problems: ['Caterpillars stripped eight plants in August 2026.'],
    fixes: ['Twice-weekly hand-picking checks and a fine net over the box during egg-laying season.'],
  },
  {
    siteId: 'hall-12-herb-spice', cropId: 'mint',
    summary: 'Spreads fast in a box of its own. Best yields in the morning-shade corner.',
    problems: ['Leggy growth when it gets full afternoon sun.'],
    fixes: ['Cut back hard every month to keep it bushy.'],
  },
  {
    siteId: 'hall-12-herb-spice', cropId: 'chilli-padi',
    summary: 'Productive since August. Used for hall supper nights.',
    problems: ['Some fruit taken before it ripens.'],
    fixes: ['Added a sign asking residents to log what they pick.'],
  },
  {
    siteId: 'hall-12-herb-spice', cropId: 'lemongrass',
    summary: 'Hardy, but planter boxes dry out quickly during vacation.',
    problems: ['Three clumps lost to drought over the July vacation week.'],
    fixes: ['Vacation watering roster with named backups; self-watering spikes in Box D.'],
  },

  /* ---------------- Earthlink's Yunnan Corner ---------------- */
  {
    siteId: 'earthlink-yunnan-corner', cropId: 'kangkong',
    summary: 'Highest-yielding crop on the plot when the wicking beds stay topped up.',
    problems: ['Reservoir ran dry over recess week in September 2026 and most of Bed 1 was lost.'],
    fixes: ['Replanted from cuttings on 28 Sep. Float valve and a recess-week roster are open issues.'],
    tips: ['Cut-and-come-again every week keeps it tender.'],
  },
  {
    siteId: 'earthlink-yunnan-corner', cropId: 'pandan',
    summary: 'The steadiest crop here. Almost no inputs needed under the tree canopy.',
    problems: [],
    fixes: [],
  },
  {
    siteId: 'earthlink-yunnan-corner', cropId: 'mint',
    summary: 'Grow-bag trial with a coir mix. Mixed results.',
    problems: ['Root rot in five bags after heavy rain; the coir mix held too much water.'],
    fixes: ['Switched to 50:50 soil and compost with extra drainage holes in the bags.'],
  },
  {
    siteId: 'earthlink-yunnan-corner', cropId: 'turmeric',
    summary: 'Lifted early in October to free the bed. Rhizomes smaller than the Yunnan Trail’s.',
    problems: ['Lifted about a month too early.'],
    fixes: ['Next time, wait until the leaves have fully died back.'],
  },

  /* ---------------- NTU Community Herb Garden ---------------- */
  {
    siteId: 'community-herb-garden', cropId: 'mint',
    summary: 'Two mint beds: an open terrace and a shade-house trial. The shade house needs less water.',
    problems: ['Mint rust spots on the open terrace in July.'],
    fixes: ['Removed affected stems and improved spacing for air flow.'],
  },
  {
    siteId: 'community-herb-garden', cropId: 'basil',
    summary: 'The garden’s most-requested herb. Seedlings in the shade house had an unexplained collapse.',
    problems: ['Six seedlings collapsed at the stem in August, cause unknown (possibly damping-off).'],
    fixes: ['Use fresh potting mix for seedlings and water from below.'],
  },
  {
    siteId: 'community-herb-garden', cropId: 'lemongrass',
    summary: 'Large established clumps on Terrace 3. Harvest every three weeks.',
    problems: [],
    fixes: [],
  },
  {
    siteId: 'community-herb-garden', cropId: 'kangkong',
    summary: 'Biggest contributor to total kg. Most of it goes to the food bank.',
    problems: ['Snails at the bed edges after rain.'],
    fixes: ['Evening hand-picking after rain; crushed eggshell border.'],
  },
  {
    siteId: 'community-herb-garden', cropId: 'chilli-padi',
    summary: 'Fruiting since September.',
    problems: ['Thrips caused leaf curl on three plants.'],
    fixes: ['Removed worst plants, water-jet the rest every 2–3 days, yellow sticky traps.'],
  },
  {
    siteId: 'community-herb-garden', cropId: 'pandan',
    summary: 'Reliable fortnightly harvests from Terrace 6.',
    problems: [],
    fixes: [],
  },
]

export const problemLog: ProblemEntry[] = [
  {
    id: 'demo-pr-001', siteId: 'hall-12-herb-spice', cropId: 'lemongrass', date: '2026-07-28',
    title: 'Lemongrass clumps dried out over vacation week',
    symptoms: 'Three clumps brown and crisp; soil pulling away from box edges.',
    cause: 'drought', actionTaken: 'Cut back to the base and watered deeply. Set up a vacation roster with backups.',
    outcome: 'No recovery for the three clumps; the rest of the box was fine.', status: 'resolved',
    reportedBy: 'Hall 12 Green Committee', tags: ['watering', 'vacation', 'roster'],
  },
  {
    id: 'demo-pr-002', siteId: 'hall-12-herb-spice', cropId: 'basil', date: '2026-08-12',
    title: 'Caterpillars on basil in Planter box A',
    symptoms: 'Leaves eaten down to the stems overnight; green droppings on lower leaves.',
    cause: 'pest', actionTaken: 'Hand-picked twice a week; fine insect net over the box.',
    outcome: 'Damage stopped within 10 days. Net stays on until November.', status: 'resolved',
    reportedBy: 'Hall 12 Green Committee', tags: ['caterpillar', 'netting', 'hand-picking'],
  },
  {
    id: 'demo-pr-003', siteId: 'community-herb-garden', cropId: 'basil', date: '2026-08-26',
    title: 'Basil seedlings collapsing in shade house',
    symptoms: 'Stems pinched and dark at soil level; seedlings fell over within two days.',
    cause: 'unknown', actionTaken: 'Removed affected trays, switched to fresh potting mix and bottom watering.',
    outcome: 'No further losses in the next sowing. Cause still unconfirmed.', status: 'resolved',
    reportedBy: 'Herb Garden Student Committee', tags: ['seedlings', 'damping-off', 'shade house'],
  },
  {
    id: 'demo-pr-004', siteId: 'earthlink-yunnan-corner', cropId: 'mint', date: '2026-09-02',
    title: 'Root rot in mint grow bags',
    symptoms: 'Wilting despite wet soil; roots brown and mushy.',
    cause: 'disease', actionTaken: 'Removed five bags; repotted the rest into 50:50 soil and compost with extra drainage.',
    outcome: 'Remaining plants recovered.', status: 'resolved',
    reportedBy: 'Earthlink NTU', tags: ['drainage', 'grow bags', 'coir'],
  },
  {
    id: 'demo-pr-005', siteId: 'community-herb-garden', cropId: 'chilli-padi', date: '2026-09-09',
    title: 'Thrips and leaf curl on chilli padi',
    symptoms: 'Curled, bronzed leaves; tiny insects visible on the undersides.',
    cause: 'pest', actionTaken: 'Removed three worst plants, water-jet every 2–3 days, yellow sticky traps.',
    outcome: 'Spread has slowed but traps still catching thrips weekly.', status: 'open',
    reportedBy: 'Herb Garden Student Committee', tags: ['thrips', 'sticky traps', 'water jet'],
  },
  {
    id: 'demo-pr-006', siteId: 'earthlink-yunnan-corner', cropId: 'kangkong', date: '2026-09-16',
    title: 'Wicking bed reservoir ran dry over recess week',
    symptoms: 'Whole bed wilted; reservoir empty; soil dry at 10 cm.',
    cause: 'drought', actionTaken: 'Cleared the bed and replanted from cuttings on 28 Sep.',
    outcome: 'Replanting established. Still need a float valve and a recess roster.', status: 'open',
    reportedBy: 'Earthlink NTU', tags: ['wicking bed', 'irrigation', 'recess week', 'roster'],
  },
  {
    id: 'demo-pr-007', siteId: 'yunnan-culinary-trail', cropId: 'chilli-padi', date: '2026-10-07',
    title: 'Dark sunken spots on chilli fruit',
    symptoms: 'Circular dark lesions on ripening fruit after a wet week.',
    cause: 'disease', actionTaken: 'Removed two plants and all affected fruit; watering at the base only.',
    outcome: 'Monitoring weekly.', status: 'open',
    reportedBy: 'Culinary Trail Committee', tags: ['anthracnose', 'fruit rot', 'wet weather'],
  },
  {
    id: 'demo-pr-008', siteId: 'community-herb-garden', cropId: 'kangkong', date: '2026-08-24',
    title: 'Snails eating kangkong at bed edges',
    symptoms: 'Ragged holes in leaves and slime trails after rain.',
    cause: 'pest', actionTaken: 'Evening hand-picking after rain; crushed eggshell border.',
    outcome: 'Damage now minor.', status: 'resolved',
    reportedBy: 'Herb Garden Student Committee', tags: ['snails', 'rain', 'hand-picking'],
  },
  {
    id: 'demo-pr-009', siteId: 'community-herb-garden', cropId: 'mint', date: '2026-07-20',
    title: 'Rust spots on open-terrace mint',
    symptoms: 'Orange pustules under leaves; yellowing.',
    cause: 'disease', actionTaken: 'Cut out affected stems and bagged them; thinned the bed for air flow.',
    outcome: 'Cleared in three weeks.', status: 'resolved',
    reportedBy: 'Herb Garden Student Committee', tags: ['rust', 'air flow', 'pruning'],
  },
  {
    id: 'demo-pr-010', siteId: 'yunnan-culinary-trail', cropId: 'basil', date: '2026-08-03',
    title: 'Basil bolting in hot spell',
    symptoms: 'Flower spikes on most plants; leaves smaller and bitter.',
    cause: 'other', actionTaken: 'Pinched spikes at each harvest; started a succession bed.',
    outcome: 'Yields held up; Bed 6 planted on 24 Aug.', status: 'resolved',
    reportedBy: 'Culinary Trail Committee', tags: ['bolting', 'heat', 'succession planting'],
  },
  {
    id: 'demo-pr-011', siteId: 'hall-12-herb-spice', cropId: 'chilli-padi', date: '2026-09-18',
    title: 'Unripe chillies being picked',
    symptoms: 'Green fruit missing from plants between harvests.',
    cause: 'other', actionTaken: 'Sign added asking residents to log what they pick.',
    outcome: 'Fewer losses, but picks are still not being logged.', status: 'open',
    reportedBy: 'Hall 12 Green Committee', tags: ['signage', 'residents', 'logging'],
  },
  {
    id: 'demo-pr-012', siteId: 'yunnan-culinary-trail', date: '2026-09-28',
    title: 'Weekly input log missed (no volunteers on roster)',
    symptoms: 'No weekly inputs submitted for the week of 28 Sep.',
    cause: 'other', actionTaken: 'Added a named backup to each roster slot.',
    outcome: 'Logging resumed the following week.', status: 'resolved',
    reportedBy: 'Culinary Trail Committee', tags: ['data completeness', 'roster'],
  },
]
