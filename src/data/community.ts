import type { JoinRequest, PickPolicy, SiteCommunity } from '../types'

/**
 * DEMONSTRATION DATA: each site's community profile (in the committee's voice) and people who asked to
 * join. Names and contacts are invented. Committees change their profile in Manage site.
 */

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const pickPolicyOptions: { value: PickPolicy; label: string; detail: string }[] = [
  { value: 'help-yourself', label: 'Help yourself', detail: 'Students may pick a little for themselves. Log it if you can.' },
  { value: 'ask-first', label: 'Ask first', detail: 'Message the committee or come on a workday before picking.' },
  { value: 'committee-only', label: 'Committee picks', detail: 'Everything goes to the pantry or members; please don’t pick.' },
]

const roles = {
  waterer: { id: 'waterer', title: 'Watering roster', detail: 'One evening a week, about 20 minutes. We train you on the first day.' },
  harvester: { id: 'harvester', title: 'Harvest and log', detail: 'Pick, weigh and log on a phone during a workday. Good first role.' },
  composter: { id: 'composter', title: 'Compost crew', detail: 'Turn the bins and collect canteen food waste once a week.' },
  grower: { id: 'grower', title: 'Bed adopter', detail: 'Look after one bed through a season, with a committee buddy.' },
  outreach: { id: 'outreach', title: 'Events and outreach', detail: 'Run a stall, a cooking demo or a hall garden tour.' },
}

export const demoCommunities: SiteCommunity[] = [
  {
    siteId: 'yunnan-culinary-trail',
    welcome: 'We grow the herbs Southeast Asian kitchens can’t do without, right on the boardwalk. Come for one Saturday and you’ll leave knowing six plants.',
    workdays: [
      { weekday: 6, start: '08:00', end: '10:30' },
      { weekday: 3, start: '17:30', end: '19:00' },
    ],
    meetingPoint: 'The tool shed at the boardwalk’s lake end',
    roles: [roles.harvester, roles.grower, roles.outreach],
    pickPolicy: 'ask-first',
  },
  {
    siteId: 'hall-12-herb-spice',
    welcome: 'Four planter boxes, a lot of chilli and basil, and supper nights to cook it all. Hall 12 residents and friends welcome.',
    workdays: [
      { weekday: 6, start: '09:00', end: '10:30' },
      { weekday: 2, start: '18:00', end: '19:00' },
    ],
    meetingPoint: 'The planter boxes outside the Hall 12 lounge',
    roles: [roles.waterer, roles.harvester, roles.composter],
    pickPolicy: 'help-yourself',
  },
  {
    siteId: 'earthlink-yunnan-corner',
    welcome: 'Earthlink’s low-water plot: wicking beds, kangkong and a lot of experiments. If you like fixing things, you’ll fit right in.',
    workdays: [
      { weekday: 4, start: '18:00', end: '19:30' },
      { weekday: 0, start: '09:00', end: '11:00' },
    ],
    meetingPoint: 'The wicking beds behind the Chinese Heritage Centre',
    roles: [roles.waterer, roles.grower],
    pickPolicy: 'ask-first',
  },
  {
    siteId: 'community-herb-garden',
    welcome: 'NTU’s oldest garden. Our student section grows culinary herbs beside the medicinal collection; we’ll show you both.',
    workdays: [
      { weekday: 6, start: '09:30', end: '12:00' },
      { weekday: 0, start: '16:00', end: '18:00' },
    ],
    meetingPoint: 'The shade house at Terrace 7',
    roles: [roles.harvester, roles.composter, roles.outreach, roles.grower],
    pickPolicy: 'committee-only',
  },
  {
    siteId: 'crescent-hall-rooftop',
    welcome: 'Three planters, one roof, a lot of basil. Small enough that you’ll learn every plant by name.',
    workdays: [{ weekday: 3, start: '18:30', end: '19:30' }],
    meetingPoint: 'The lift lobby on the top floor',
    roles: [roles.waterer, roles.harvester],
    pickPolicy: 'help-yourself',
  },
  {
    siteId: 'tamarind-hall-garden',
    welcome: 'Our garden feeds the Friday cook-up. Come early, get muddy, stay for dinner.',
    workdays: [
      { weekday: 5, start: '17:00', end: '18:30' },
      { weekday: 6, start: '08:30', end: '10:00' },
    ],
    meetingPoint: 'The hall pantry door',
    roles: [roles.harvester, roles.composter, roles.grower, roles.outreach],
    pickPolicy: 'ask-first',
  },
  {
    siteId: 'hall-2-corridor',
    welcome: 'A new club with two troughs and big plans. We especially need waterers.',
    workdays: [{ weekday: 1, start: '19:00', end: '19:45' }],
    meetingPoint: 'The ground-floor corridor by the laundry',
    roles: [roles.waterer],
    pickPolicy: 'help-yourself',
  },
]

export const demoJoins: JoinRequest[] = [
  { id: 'demo-join-1', siteId: 'hall-12-herb-spice', name: 'Arjun Nair', hall: 'Hall 12', contactMethod: 'telegram', contact: '@arjun.demo', roleId: 'harvester', consent: true, status: 'welcomed', createdAt: '2026-08-18T20:10:00+08:00', source: 'demo' },
  { id: 'demo-join-2', siteId: 'hall-12-herb-spice', name: 'Siti Aminah', hall: 'Hall 12', contactMethod: 'email', contact: 'siti.demo@example.com', roleId: 'waterer', note: 'Free most evenings.', consent: true, status: 'contacted', createdAt: '2026-09-22T12:40:00+08:00', source: 'demo' },
  { id: 'demo-join-3', siteId: 'yunnan-culinary-trail', name: 'Chloe Lim', hall: 'Hall 4', contactMethod: 'telegram', contact: '@chloe.demo', roleId: 'harvester', consent: true, status: 'welcomed', createdAt: '2026-08-25T09:00:00+08:00', source: 'demo' },
  { id: 'demo-join-4', siteId: 'yunnan-culinary-trail', name: 'Hafiz Rahman', hall: 'Crescent Hall', contactMethod: 'phone', contact: '8123 0000 (demo)', roleId: 'grower', note: 'Grew chillies at home for years.', consent: true, status: 'new', createdAt: '2026-10-09T21:15:00+08:00', source: 'demo' },
  { id: 'demo-join-5', siteId: 'earthlink-yunnan-corner', name: 'Daniel Ong', hall: 'Hall 2', contactMethod: 'email', contact: 'daniel.ong.demo@example.com', roleId: 'grower', consent: true, status: 'new', createdAt: '2026-10-12T18:30:00+08:00', source: 'demo' },
  { id: 'demo-join-6', siteId: 'community-herb-garden', name: 'Wei Ling Goh', hall: 'Hall 9', contactMethod: 'telegram', contact: '@weiling.demo', roleId: 'composter', consent: true, status: 'welcomed', createdAt: '2026-08-30T10:20:00+08:00', source: 'demo' },
  { id: 'demo-join-7', siteId: 'community-herb-garden', name: 'Priya Menon', hall: 'Pioneer Hall', contactMethod: 'email', contact: 'priya.demo@example.com', roleId: 'outreach', note: 'Can run a cooking demo in Week 10.', consent: true, status: 'contacted', createdAt: '2026-09-30T14:05:00+08:00', source: 'demo' },
  ...hallJoins('crescent-hall-rooftop', 'Crescent Hall', ['Nur Aisyah', 'Marcus Teo'], ['harvester', 'waterer']),
  ...hallJoins('tamarind-hall-garden', 'Tamarind Hall', ['Rachel Koh', 'Vikram Pillai', 'Zhang Min', 'Sarah Yeo', 'Imran Hakim', 'Tan Li Ting', 'Kevin Chua', 'Divya Iyer'], ['harvester', 'composter', 'grower', 'outreach']),
  ...hallJoins('hall-2-corridor', 'Hall 2', ['Ethan Goh', 'Mei Ling Ho'], ['waterer']),
]

/** Demo members of the invented hall gardens, joined across the semester. */
function hallJoins(siteId: string, hall: string, names: string[], roleIds: string[]): JoinRequest[] {
  return names.map((name, i) => ({
    id: `demo-join-${siteId}-${i + 1}`,
    siteId,
    name,
    hall,
    contactMethod: 'telegram',
    contact: `@${name.toLowerCase().replace(/[^a-z]+/g, '')}.demo`,
    roleId: roleIds[i % roleIds.length],
    consent: true,
    status: i % 3 === 2 ? 'contacted' : 'welcomed',
    createdAt: `2026-${i % 2 === 0 ? '08' : '09'}-${String(12 + i * 2).padStart(2, '0')}T19:00:00+08:00`,
    source: 'demo',
  }))
}

export const JOIN_PRIVACY_NOTE =
  'Saved only in this browser for this demo. In the real platform only this site’s committee would see your contact details, and only to welcome you. Change or delete them any time on My gardens.'
