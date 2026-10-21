import type { Crop } from '../types'

/**
 * Controlled crop vocabulary: the only crops the Log forms accept. Add new crops here (or, on a device,
 * from Manage site). Each crop carries its care guide for Learn, bed pages and Grow more: practical
 * steps for Singapore's climate, written for a first-time grower. Days are typical, not promises.
 */
export const crops: Crop[] = [
  {
    id: 'basil',
    name: 'Thai basil',
    scientificName: 'Ocimum basilicum var. thyrsiflora',
    daysToFirstHarvest: 45,
    form: 'upright-herb',
    careGuide: {
      summary: 'Fast, forgiving and always in demand. The best first crop for a hall garden.',
      light: 'Full or morning sun',
      startFrom: 'seed',
      stageDays: { seedling: 7, growing: 18, ready: 40, harvest: 45 },
      steps: {
        sow: [
          'Sow seeds on moist seed mix and barely cover them: they need light to sprout.',
          'Keep the tray in bright shade and mist it every morning. Seeds sprout in 5 to 10 days.',
          'Short on time? Root a 10 cm cutting in a glass of water instead.',
        ],
        seedling: [
          'Keep the strongest seedling in each pot once two true leaves show.',
          'Give it three or four mornings of sun before planting out.',
          'Plant 25 to 30 cm apart.',
        ],
        growing: [
          'Pinch out the top above the third pair of leaves so it branches.',
          'Water at the base every morning in dry spells.',
          'Check under the leaves for caterpillar eggs twice a week.',
        ],
        ready: ['Ready at about 30 cm, bushy, with six or more pairs of leaves.'],
        harvest: [
          'Cut stems just above a leaf pair. Never take more than a third of the plant.',
          'Harvest in the cool morning and keep the stems in water, not the fridge.',
          'Start a new bed every 10 to 12 weeks: plants go woody by month four.',
        ],
      },
      readySign: 'Bushy, about 30 cm tall, flower spikes starting. Pinch the spikes so the leaves stay sweet.',
      climate: [
        'Loves the heat, but wilts in afternoon sun in planter boxes. Morning sun is enough.',
        'Hot, dry spells (February to April) make it flower fast: pinch the spikes every week.',
        'Monsoon downpours (November to January) splash soil onto leaves. Mulch, and raise pots off the ground.',
      ],
      quickCare: [
        'Morning sun. Water at the base daily in dry spells.',
        'Pinch flower spikes and the tip to keep it bushy.',
        'Cut a third at most, just above a leaf pair.',
      ],
      plantsPerSqm: 9,
    },
  },
  {
    id: 'mint',
    name: 'Mint',
    localName: 'Pudina',
    scientificName: 'Mentha spp.',
    daysToFirstHarvest: 50,
    form: 'spreading-herb',
    careGuide: {
      summary: 'Grows from a single cutting and never stops. Give it a box of its own.',
      light: 'Part shade',
      startFrom: 'cutting',
      stageDays: { seedling: 10, growing: 20, ready: 45, harvest: 50 },
      steps: {
        sow: [
          'Take a 10 cm stem, strip the lower leaves and stand it in water or moist mix.',
          'Cuttings root in about a week. Mint seed is slow and patchy.',
          'Plant it in its own container: it spreads and takes over shared beds.',
        ],
        seedling: [
          'Pot it up once the roots are 2 to 3 cm long.',
          'Keep it moist and in bright shade for the first two weeks.',
        ],
        growing: [
          'Keep the soil evenly moist. Mint sulks when it dries out.',
          'Cut leggy stems back to the next pair of leaves.',
          'Morning sun, afternoon shade.',
        ],
        ready: ['Ready when the stems are about 20 cm long and leafy.'],
        harvest: [
          'Cut whole stems to 5 cm above the soil. They regrow in three to four weeks.',
          'Cut the whole plant back hard once a month to keep it bushy.',
        ],
      },
      readySign: 'Dense, leafy stems 20 to 30 cm long, leaves bright and soft.',
      climate: [
        'Struggles in full afternoon sun on hot rooftops. Part shade works best here.',
        'Rust and mildew spread in the humid monsoon months: thin the stems so air moves.',
        'Roots fill a box fast in our warmth. Repot or divide every six months.',
      ],
      quickCare: [
        'Part shade. Keep the soil moist, never dry.',
        'Grow it in its own box: it spreads.',
        'Cut back hard every month; harvest whole stems.',
      ],
      plantsPerSqm: 12,
    },
  },
  {
    id: 'lemongrass',
    name: 'Lemongrass',
    localName: 'Serai',
    scientificName: 'Cymbopogon citratus',
    daysToFirstHarvest: 100,
    form: 'grass-clump',
    careGuide: {
      summary: 'Almost no effort once it settles in. A clump feeds a kitchen for years.',
      light: 'Full sun',
      startFrom: 'cutting',
      stageDays: { seedling: 14, growing: 30, ready: 90, harvest: 100 },
      steps: {
        sow: [
          'Stand a stalk with its base intact in a glass of water.',
          'Change the water every two days. Roots appear in one to two weeks.',
        ],
        seedling: [
          'Plant it once the roots are 3 to 5 cm long, with the base 2 to 3 cm deep.',
          'Leave 60 cm between clumps: they get big.',
        ],
        growing: [
          'Full sun and a deep watering twice a week.',
          'Feed with compost every six to eight weeks.',
          'Brown leaf tips are normal. Trim them if you like.',
        ],
        ready: ['Ready when stalks are at least 1 cm thick at the base.'],
        harvest: [
          'Twist or cut the outer stalks off at soil level. Leave the centre to keep growing.',
          'Harvest every three weeks from an established clump.',
          'Divide the clump every six to eight months.',
        ],
      },
      readySign: 'A clump about 60 cm tall with stalks 1 cm thick or more at the base.',
      climate: [
        'One of the hardiest crops for Singapore: it loves heat and sun.',
        'Copes with dry spells once settled, but waterlogged monsoon soil rots the base. Plant it where water drains.',
        'Clumps crowd themselves in about six months here. Divide them and replant the outer pieces.',
      ],
      quickCare: [
        'Full sun. Water deeply twice a week.',
        'Twist off outer stalks at the base.',
        'Divide the clump every 6 to 8 months.',
      ],
      plantsPerSqm: 3,
    },
  },
  {
    id: 'pandan',
    name: 'Pandan',
    localName: 'Daun pandan',
    scientificName: 'Pandanus amaryllifolius',
    daysToFirstHarvest: 90,
    form: 'rosette',
    careGuide: {
      summary: 'A shade-lover that the pantry always wants for kuih and drinks.',
      light: 'Part shade',
      startFrom: 'seedling',
      stageDays: { seedling: 14, growing: 30, ready: 80, harvest: 90 },
      steps: {
        sow: [
          'Cut a side shoot from a mother plant with a few roots attached.',
          'Pot it in moist, rich mix and keep it in the shade.',
        ],
        seedling: [
          'Keep it in bright shade until new leaves unfurl from the centre.',
          'Water every other day: pandan likes damp soil.',
        ],
        growing: [
          'Part shade and steady moisture. It does well near water.',
          'Mulch with leaf litter to keep the roots cool.',
          'Pull off brown lower leaves.',
        ],
        ready: ['Ready when the rosette is full and the leaves are 40 cm or longer.'],
        harvest: [
          'Cut the outer, mature leaves at the base and leave the young centre.',
          'Take a few leaves from each plant each week.',
          'Pot up the side shoots: they are your next plants.',
        ],
      },
      readySign: 'A full rosette of glossy leaves 40 cm long or more.',
      climate: [
        'Native to the region and happy in our humidity.',
        'Leaf tips brown in the dry months (February to April). Mulch and water twice a week.',
        'Scorches in open afternoon sun. Part shade is best.',
      ],
      quickCare: [
        'Part shade. Keep the soil damp and mulched.',
        'Cut outer leaves at the base; leave the centre.',
        'Pot up side shoots for new plants.',
      ],
      plantsPerSqm: 4,
    },
  },
  {
    id: 'chilli-padi',
    name: 'Chilli padi',
    localName: 'Cili padi',
    scientificName: 'Capsicum frutescens',
    daysToFirstHarvest: 85,
    form: 'fruiting-shrub',
    careGuide: {
      summary: 'Small plant, fierce fruit, picked all year round once it starts.',
      light: 'Full sun',
      startFrom: 'seed',
      stageDays: { seedling: 10, growing: 25, ready: 75, harvest: 85 },
      steps: {
        sow: [
          'Sow seeds 0.5 cm deep in a seed tray. Keep it warm and moist.',
          'Seeds sprout in 7 to 14 days.',
        ],
        seedling: [
          'Transplant at about 10 cm tall, with four to six true leaves.',
          'Plant 40 cm apart in full sun.',
        ],
        growing: [
          'Water deeply when the top 2 cm of soil is dry.',
          'Stake the plant once it passes 40 cm.',
          'Feed with compost when the first flowers open.',
        ],
        ready: ['Ready when the small upright fruit turn from green to bright red.'],
        harvest: [
          'Snip each chilli off with its stalk. Pulling breaks the branches.',
          'Pick often: the more you pick, the more it fruits.',
          'Wear gloves, and wash your hands before you touch your face.',
        ],
      },
      readySign: 'Small upright fruit turning from green to bright red.',
      climate: [
        'Fruits all year in Singapore’s warmth.',
        'Wet weeks bring fruit rot with dark sunken spots. Remove spotted fruit and water at the base.',
        'Aphids and whitefly gather on new growth in dry spells. Check the tips weekly.',
      ],
      quickCare: [
        'Full sun. Water when the top 2 cm is dry.',
        'Stake tall plants; feed when it flowers.',
        'Snip red fruit off with the stalk; wear gloves.',
      ],
      plantsPerSqm: 4,
    },
  },
  {
    id: 'turmeric',
    name: 'Turmeric',
    localName: 'Kunyit',
    scientificName: 'Curcuma longa',
    daysToFirstHarvest: 240,
    form: 'broadleaf-rhizome',
    careGuide: {
      summary: 'Slow, about eight months, and then the biggest single harvest on campus.',
      light: 'Part shade to sun',
      startFrom: 'cutting',
      stageDays: { seedling: 28, growing: 60, ready: 220, harvest: 240 },
      steps: {
        sow: [
          'Plant a fresh piece of rhizome with two or three buds, 5 cm deep, buds facing up.',
          'Keep it moist but not soggy. Shoots take three to four weeks to show.',
        ],
        seedling: [
          'Shoots come up as rolled leaves. Keep the bed weeded around them.',
          'Mulch thickly to hold the moisture in.',
        ],
        growing: [
          'Regular water, part shade to full sun.',
          'Pile soil up around the base as it grows.',
          'Feed with compost every two months.',
        ],
        ready: ['Ready when most of the leaves have yellowed and dried.'],
        harvest: [
          'Loosen the soil around the clump with a fork and lift the rhizomes.',
          'Lift in sections over a few weekends so the pantry isn’t swamped.',
          'Keep a few healthy pieces back to plant next season.',
        ],
      },
      readySign: 'Most leaves yellow and dry, about eight months after planting.',
      climate: [
        'A tropical native: the long wet season suits it.',
        'Rhizomes rot in waterlogged beds in the monsoon. Raise the bed or mix in sand.',
        'Its eight-month cycle fits an academic year: plant in August, lift by April.',
      ],
      quickCare: [
        'Part shade to sun. Moist, never waterlogged.',
        'Mulch thickly; pile soil up as it grows.',
        'Lift when the leaves yellow, about 8 months in.',
      ],
      plantsPerSqm: 6,
    },
  },
  {
    id: 'kangkong',
    name: 'Kangkong',
    localName: 'Water spinach',
    scientificName: 'Ipomoea aquatica',
    daysToFirstHarvest: 28,
    form: 'leafy-vine',
    careGuide: {
      summary: 'The fastest crop we grow: a first harvest in about four weeks.',
      light: 'Full sun',
      startFrom: 'seed',
      stageDays: { seedling: 5, growing: 10, ready: 24, harvest: 28 },
      steps: {
        sow: [
          'Soak the seeds overnight, then sow them 1 cm deep and 10 cm apart.',
          'Or plant cuttings: the stems root in water within days.',
        ],
        seedling: ['Keep the soil wet. Kangkong is a water plant.', 'Thin the seedlings to 15 cm apart.'],
        growing: [
          'Water every day. It never wants to dry out.',
          'Full sun gives the fastest growth.',
          'Feed with compost tea every two weeks.',
        ],
        ready: ['Ready when the stems are 25 to 30 cm long and tender.'],
        harvest: [
          'Cut the stems 5 cm above the soil. Side shoots grow back for more cuts.',
          'Harvest every one to two weeks.',
          'Cook it the same day: it wilts fast.',
        ],
      },
      readySign: 'Tender stems 25 to 30 cm long, about four weeks after sowing.',
      climate: [
        'Thrives in Singapore’s heat and grows all year.',
        'Dries out in hours in hot spells. One missed watering can lose a bed, so wicking beds help.',
        'Heavy monsoon rain is fine as long as the bed drains.',
      ],
      quickCare: [
        'Full sun. Water every day.',
        'Cut stems 5 cm above the soil to regrow.',
        'Harvest every 1 to 2 weeks; cook it the same day.',
      ],
      plantsPerSqm: 25,
    },
  },
]
