import type { Protocol } from '../types'

/**
 * DEMONSTRATION DATA — shared protocols used by all four sites.
 * Draft wording for the prototype; have them reviewed by the relevant NTU office before real use.
 */
export const protocols: Protocol[] = [
  {
    id: 'food-safety-basics',
    category: 'food-safety',
    title: 'Food safety for campus produce',
    summary: 'Minimum hygiene steps before any produce leaves a site for the pantry, members or a food bank.',
    steps: [
      'Wash hands with soap before harvesting. Cover cuts with a waterproof plaster and gloves.',
      'Use only clean, food-grade containers. Never reuse compost, fertiliser or chemical containers for produce.',
      'Do not harvest from beds splashed by flood water or fouled by animal droppings in the last 7 days.',
      'Do not harvest a bed that was sprayed until the product label’s waiting period has passed. Check the problem log for spray dates.',
      'Rinse produce with tap water on site. Discard anything slimy, mouldy or insect-damaged to compost.',
      'Keep harvested produce in the shade and get it chilled or handed over within 2 hours.',
      'Label every bag or tub with site, crop and harvest date.',
    ],
    lastReviewed: '2026-08-10',
    version: '1.2',
  },
  {
    id: 'harvest-handling',
    category: 'harvest-handling',
    title: 'Harvest, weigh and log',
    summary: 'How to harvest so plants keep producing, and how to record it in under a minute.',
    steps: [
      'Harvest in the morning when leaves are cool and firm.',
      'Leafy herbs: cut above a pair of leaves, taking no more than a third of the plant.',
      'Kangkong: cut 10 cm above the base so it regrows. Lemongrass: cut whole stalks at soil level from the outside of the clump.',
      'Weigh on the site scale with the container tared. Record to the nearest 0.05 kg.',
      'Take one photo of the harvest on the scale, then log it on the Log page before leaving the site.',
      'Choose a destination: pantry first, then members, then food bank. Compost only what cannot be eaten.',
    ],
    lastReviewed: '2026-08-10',
    version: '2.0',
  },
  {
    id: 'storage-distribution',
    category: 'harvest-handling',
    title: 'Storage and hand-off to the pantry or food bank',
    summary: 'Keeping produce fresh between the bed and the person eating it.',
    steps: [
      'Herbs: wrap stems in damp paper towel, bag loosely and refrigerate. Basil keeps better at room temperature in a jar of water.',
      'Kangkong: refrigerate the same day; it wilts within hours in the heat.',
      'Turmeric: brush off soil, dry in the shade for a day, then store dry and cool.',
      'Hand produce to the pantry coordinator in person and note the drop-off in the harvest log notes.',
      'Food bank donations go out on the agreed pickup day only. Do not leave produce unattended at the collection point.',
    ],
    lastReviewed: '2026-01-12',
    version: '1.0',
  },
  {
    id: 'pest-response',
    category: 'pest-response',
    title: 'Pest and disease response',
    summary: 'A step-by-step response that starts with the least harmful option.',
    steps: [
      'Identify first: photograph the damage and compare it with the problem log before treating anything.',
      'Remove by hand: pick off caterpillars and snails, prune badly affected leaves, and bag them for disposal (not compost).',
      'Blast aphids, mites and thrips off with a strong jet of water, every 2–3 days for a week.',
      'If the problem persists, use an insecticidal soap or neem product approved by the site lead. Follow the label and record the date applied.',
      'Isolate or remove plants with spreading disease (root rot, anthracnose). Clean tools afterwards.',
      'Log a Failure entry for any plants lost and add a problem log entry describing what worked.',
    ],
    lastReviewed: '2026-09-21',
    version: '1.3',
  },
]
