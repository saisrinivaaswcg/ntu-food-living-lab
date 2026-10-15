import type { ChecklistItem, HandoverRecord } from '../types'

/**
 * DEMONSTRATION DATA — committee handover records.
 * All names and contacts are fictional. The latest record per site is the
 * "current" handover; earlier ones form the history list.
 */

/** Standard checklist every outgoing lead completes. */
export const HANDOVER_CHECKLIST_TEMPLATE: { id: string; label: string }[] = [
  { id: 'keys', label: 'Tool shed / store key handed over' },
  { id: 'roster', label: 'Watering roster updated with names and backups' },
  { id: 'walkthrough', label: 'Site walk-through done with incoming leads' },
  { id: 'issues', label: 'Open issues reviewed on site' },
  { id: 'logging', label: 'Incoming leads shown how to log on this platform' },
  { id: 'protocols', label: 'Shared protocols read and acknowledged' },
  { id: 'contacts', label: 'Contacts list checked and still correct' },
  { id: 'bedmap', label: 'Bed map and crop list updated' },
]

function checklist(doneIds: string[] | 'all'): ChecklistItem[] {
  return HANDOVER_CHECKLIST_TEMPLATE.map((item) => ({
    ...item,
    done: doneIds === 'all' || doneIds.includes(item.id),
  }))
}

const advisor = { name: 'Dr. Lee Wen Hui (demo)', role: 'Faculty advisor', contact: 'advisor.demo@example.com' }
const facilities = { name: 'Grounds team (demo)', role: 'Office of Facilities — grounds & irrigation', contact: 'grounds.demo@example.com' }
const pantry = { name: 'Student pantry (demo)', role: 'Pantry coordinator', contact: 'pantry.demo@example.com' }
const foodBank = { name: 'Food bank pickups (demo)', role: 'Partner food bank coordinator', contact: 'foodbank.demo@example.com' }

export const handovers: HandoverRecord[] = [
  /* ---------------- Yunnan Garden Culinary Trail ---------------- */
  {
    id: 'demo-ho-yct-1', siteId: 'yunnan-culinary-trail', date: '2025-08-11', term: 'AY2025/26 Semester 1',
    outgoingLeads: [{ name: 'Rachel Tan', role: 'Site lead', contact: 'rachel.demo@example.com' }],
    incomingLeads: [{ name: 'Daniel Koh', role: 'Site lead', contact: 'daniel.demo@example.com' }],
    siteStatus: 'establishing',
    statusSummary: 'First year on the trail. Four beds planted; signage still being designed.',
    openIssues: [
      { title: 'Interpretive signs not installed', priority: 'medium', detail: 'Designs approved; waiting on printing.' },
      { title: 'Only two regular volunteers', priority: 'high', detail: 'Recruit at the CCA fair.' },
    ],
    contacts: [advisor, facilities],
    lessonsLearnt: [
      'Raised beds drain far better than in-ground beds after heavy rain.',
      'Visitors pick herbs — signage saying what is for the pantry helps.',
    ],
    checklist: checklist('all'),
  },
  {
    id: 'demo-ho-yct-2', siteId: 'yunnan-culinary-trail', date: '2026-01-12', term: 'AY2025/26 Semester 2',
    outgoingLeads: [{ name: 'Daniel Koh', role: 'Site lead', contact: 'daniel.demo@example.com' }],
    incomingLeads: [{ name: 'Nur Syafiqah', role: 'Site lead', contact: 'syafiqah.demo@example.com' }],
    siteStatus: 'active',
    statusSummary: 'Six beds active. Turmeric planted in Bed 4 this month.',
    openIssues: [
      { title: 'Paper logbook gaps', priority: 'medium', detail: 'About a third of weeks have no water record.' },
    ],
    contacts: [advisor, facilities, pantry],
    lessonsLearnt: [
      'Paper logbooks get wet and lost — move logging online.',
      'Turmeric needs about eight months; plan the bed for the whole year.',
    ],
    checklist: checklist(['keys', 'roster', 'walkthrough', 'issues', 'contacts', 'bedmap', 'protocols']),
  },
  {
    id: 'demo-ho-yct-3', siteId: 'yunnan-culinary-trail', date: '2026-08-10', lastUpdated: '2026-10-08', term: 'AY2026/27 Semester 1',
    outgoingLeads: [{ name: 'Nur Syafiqah', role: 'Site lead', contact: 'syafiqah.demo@example.com' }],
    incomingLeads: [
      { name: 'Vikram Pillai', role: 'Co-lead (operations)', contact: 'vikram.demo@example.com' },
      { name: 'Chloe Lim', role: 'Co-lead (data & outreach)', contact: 'chloe.demo@example.com' },
    ],
    siteStatus: 'active',
    statusSummary: 'All six beds in production. Turmeric lifted in three batches (Sep–Oct); succession basil in Bed 6.',
    openIssues: [
      { title: 'Chilli fruit rot after wet weeks', priority: 'medium', detail: 'See problem log, 7 Oct. Watch Bed 5 weekly.' },
      { title: 'Roster has no backups for Sunday', priority: 'high', detail: 'A missed week on 28 Sep came from this.' },
      { title: 'Bed 1 basil going woody', priority: 'low', detail: 'Pull and replant once Bed 6 is cropping well.' },
    ],
    contacts: [advisor, facilities, pantry, foodBank],
    lessonsLearnt: [
      'Lift turmeric in sections so the pantry is not swamped in one week.',
      'Logging on a phone at the bed is the only way the weekly record stays complete.',
      'A succession basil bed avoids a gap when the first bed goes woody.',
    ],
    checklist: checklist(['keys', 'roster', 'walkthrough', 'issues', 'logging', 'protocols']),
  },

  /* ---------------- Hall 12 Herb & Spice Garden ---------------- */
  {
    id: 'demo-ho-h12-1', siteId: 'hall-12-herb-spice', date: '2025-08-04', term: 'AY2025/26 Semester 1',
    outgoingLeads: [{ name: 'Marcus Ong', role: 'Green Committee head', contact: 'marcus.demo@example.com' }],
    incomingLeads: [{ name: 'Aisha Rahman', role: 'Green Committee head', contact: 'aisha.demo@example.com' }],
    siteStatus: 'active',
    statusSummary: 'Four planter boxes rotating leafy greens and herbs.',
    openIssues: [
      { title: 'Box C drains slowly', priority: 'low', detail: 'Add gravel layer when next replanted.' },
    ],
    contacts: [advisor, { name: 'Hall 12 office (demo)', role: 'Hall management', contact: 'hall12.demo@example.com' }],
    lessonsLearnt: [
      'Plant one or two crops per box — mixed boxes get crowded.',
      'Orientation weeks are the hardest time to find volunteers.',
    ],
    checklist: checklist('all'),
  },
  {
    id: 'demo-ho-h12-2', siteId: 'hall-12-herb-spice', date: '2026-08-03', lastUpdated: '2026-10-06', term: 'AY2026/27 Semester 1',
    outgoingLeads: [{ name: 'Aisha Rahman', role: 'Green Committee head', contact: 'aisha.demo@example.com' }],
    incomingLeads: [
      { name: 'Jonathan Lee', role: 'Green Committee head', contact: 'jonathan.demo@example.com' },
      { name: 'Mei Ling Chua', role: 'Garden coordinator', contact: 'meiling.demo@example.com' },
    ],
    siteStatus: 'active',
    statusSummary: 'Basil, mint, chilli padi and lemongrass in the four boxes. Lost three lemongrass clumps over vacation.',
    openIssues: [
      { title: 'Weekly logs missed in hall event weeks', priority: 'high', detail: 'Four weeks missed this term — assign a logging owner per week.' },
      { title: 'Residents picking chillies without logging', priority: 'medium', detail: 'Sign is up; consider a QR code to the Log page.' },
    ],
    contacts: [advisor, { name: 'Hall 12 office (demo)', role: 'Hall management', contact: 'hall12.demo@example.com' }, pantry],
    lessonsLearnt: [
      'Vacation watering needs named backups, not a group chat.',
      'A fine net over basil stops caterpillars without any spraying.',
    ],
    checklist: checklist(['keys', 'walkthrough', 'issues', 'logging', 'contacts']),
  },

  /* ---------------- Earthlink's Yunnan Corner ---------------- */
  {
    id: 'demo-ho-eyc-1', siteId: 'earthlink-yunnan-corner', date: '2026-01-19', term: 'AY2025/26 Semester 2',
    outgoingLeads: [{ name: 'Ethan Wong', role: 'Earthlink garden director', contact: 'ethan.demo@example.com' }],
    incomingLeads: [{ name: 'Farhan Ismail', role: 'Earthlink garden director', contact: 'farhan.demo@example.com' }],
    siteStatus: 'establishing',
    statusSummary: 'Two wicking beds built. Pandan established; turmeric going in next month.',
    openIssues: [
      { title: 'Wicking bed overflow outlets blocked', priority: 'medium', detail: 'Clear leaves weekly.' },
    ],
    contacts: [advisor, facilities],
    lessonsLearnt: [
      'Wicking beds cut watering to about once a week when topped up.',
      'Tree canopy shade suits pandan but not chilli.',
    ],
    checklist: checklist('all'),
  },
  {
    id: 'demo-ho-eyc-2', siteId: 'earthlink-yunnan-corner', date: '2026-08-17', lastUpdated: '2026-09-29', term: 'AY2026/27 Semester 1',
    outgoingLeads: [{ name: 'Farhan Ismail', role: 'Earthlink garden director', contact: 'farhan.demo@example.com' }],
    incomingLeads: [
      { name: 'Sophie Teo', role: 'Garden director', contact: 'sophie.demo@example.com' },
      { name: 'Ravi Shankar', role: 'Water systems lead', contact: 'ravi.demo@example.com' },
    ],
    siteStatus: 'needs-attention',
    statusSummary: 'Bed 1 kangkong lost to drought in recess week and replanted on 28 Sep. Bed 2 producing; mint trial recovering.',
    openIssues: [
      { title: 'No float valve on wicking reservoirs', priority: 'high', detail: 'Reservoir ran dry in recess week (16 Sep) and Bed 1 was lost. Install before the next break.' },
      { title: 'Recess-week roster', priority: 'high', detail: 'No one on site during recess; arrange cover with the Herb Garden team.' },
      { title: 'Weekly logs patchy', priority: 'medium', detail: 'Four weeks missed so far this term.' },
    ],
    contacts: [advisor, facilities, foodBank],
    lessonsLearnt: [
      'Coir-heavy mix holds too much water for mint in grow bags.',
      'Turmeric lifted early gave small rhizomes — wait for full die-back.',
    ],
    checklist: checklist(['keys', 'walkthrough', 'issues', 'logging']),
  },

  /* ---------------- NTU Community Herb Garden ---------------- */
  {
    id: 'demo-ho-chg-1', siteId: 'community-herb-garden', date: '2025-08-11', term: 'AY2025/26 Semester 1',
    outgoingLeads: [{ name: 'Lim Jia Hui', role: 'Student committee chair', contact: 'jiahui.demo@example.com' }],
    incomingLeads: [{ name: 'Arjun Menon', role: 'Student committee chair', contact: 'arjun.demo@example.com' }],
    siteStatus: 'active',
    statusSummary: 'Student section of eight terraces running alongside the medicinal collection.',
    openIssues: [
      { title: 'Shade house roof torn', priority: 'medium', detail: 'Reported to grounds team.' },
    ],
    contacts: [advisor, facilities, { name: 'Garden volunteers (demo)', role: 'Long-standing volunteer gardeners', contact: 'volunteers.demo@example.com' }],
    lessonsLearnt: [
      'Ask the long-standing volunteers before changing any terrace — they know what grows where.',
      'Kangkong is the easiest way to get volume for the food bank.',
    ],
    checklist: checklist('all'),
  },
  {
    id: 'demo-ho-chg-2', siteId: 'community-herb-garden', date: '2026-01-12', term: 'AY2025/26 Semester 2',
    outgoingLeads: [{ name: 'Arjun Menon', role: 'Student committee chair', contact: 'arjun.demo@example.com' }],
    incomingLeads: [{ name: 'Tan Yi Xuan', role: 'Student committee chair', contact: 'yixuan.demo@example.com' }],
    siteStatus: 'active',
    statusSummary: 'All terraces productive. Shade house repaired in December.',
    openIssues: [
      { title: 'Vermicompost supply', priority: 'low', detail: 'Supplier raised prices; trial campus food-waste compost.' },
    ],
    contacts: [advisor, facilities, foodBank],
    lessonsLearnt: [
      'Campus food-waste compost works as well as bought vermicompost for leafy crops.',
    ],
    checklist: checklist('all'),
  },
  {
    id: 'demo-ho-chg-3', siteId: 'community-herb-garden', date: '2026-08-10', lastUpdated: '2026-10-04', term: 'AY2026/27 Semester 1',
    outgoingLeads: [{ name: 'Tan Yi Xuan', role: 'Student committee chair', contact: 'yixuan.demo@example.com' }],
    incomingLeads: [
      { name: 'Hafiz Rahim', role: 'Committee chair', contact: 'hafiz.demo@example.com' },
      { name: 'Grace Chen', role: 'Harvest & data lead', contact: 'grace.demo@example.com' },
    ],
    siteStatus: 'active',
    statusSummary: 'Eight terraces in production. Shade-house mint trial started in July.',
    openIssues: [
      { title: 'Thrips on chilli padi', priority: 'medium', detail: 'Sticky traps in place; see problem log, 9 Sep.' },
      { title: 'Food bank pickup day changing', priority: 'low', detail: 'Confirm the new day before Week 10.' },
    ],
    contacts: [advisor, facilities, pantry, foodBank],
    lessonsLearnt: [
      'Weekly input logging is easiest when the same person does the Sunday watering.',
      'Fresh potting mix for every seedling tray — reused mix is the likely cause of seedling losses.',
    ],
    checklist: checklist(['keys', 'roster', 'walkthrough', 'issues', 'logging', 'protocols', 'contacts']),
  },
]
