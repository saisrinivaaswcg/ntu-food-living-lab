/**
 * Each crop is drawn from the same parts (stem, leaf, blade, fruit, soil line, roots), arranged by its
 * plant form. Every part has a window of the journey (t) in which it grows in from its origin, and
 * optionally one in which it fades out again (seed leaves, cut stems). GrowingPlant turns these into
 * CSS that reads a single --grow value, so the whole drawing animates with transform and opacity only.
 */
import type { Crop, PlantForm, PropagationType } from '../../types'
import { g, inReady, PEAK, STAGE_WINDOWS } from './journey'
import {
  along,
  BASE,
  BASKET_PATH,
  blade,
  curve,
  cutMark,
  flower,
  leaf,
  place,
  pod,
  rhizome,
  spike,
  tipOf,
  type Pt,
} from './plantGeometry'

export type Paint = 'stem' | 'leaf' | 'leaf-dry' | 'fruit' | 'flower' | 'root' | 'rhizome' | 'seed' | 'mark' | 'basket'

export interface PlantPart {
  d: string
  paint: Paint
  /** Where it grows from (transform origin, in view-box units) */
  origin: Pt
  /** Journey window in which it grows in */
  grow: [number, number]
  /** Journey window in which it fades out again */
  fade?: [number, number]
}

/** Where each specimen tag ties onto the plant. */
export interface TagAnchors {
  stem: Pt
  leaf: Pt
  base: Pt
  top: Pt
}

export interface PlantDrawing {
  parts: PlantPart[]
  anchors: TagAnchors
}

const CUT = PEAK.cut
const sow = STAGE_WINDOWS.sow
/** g window helper: growth fractions → journey t */
const gw = (a: number, b: number): [number, number] => [g(a), g(b)]

/* ------------------------------------------------------------------ */
/* Shared: the start (seed, cutting or rhizome piece), roots, basket   */
/* ------------------------------------------------------------------ */

function start(from: PropagationType, form: PlantForm): PlantPart[] {
  const sprout = gw(0, 0.12)
  if (form === 'broadleaf-rhizome') {
    return [{ d: rhizome([88, 212], [112, 210], 9), paint: 'rhizome', origin: [100, 211], grow: [sow[0], sow[0] + 0.03], fade: gw(0.5, 0.65) }]
  }
  if (from === 'seed') {
    return [
      { d: 'M97 209 C97 205 103 205 103 209 C103 213 97 213 97 209 Z', paint: 'seed', origin: [100, 209], grow: [sow[0], sow[0] + 0.02], fade: sprout },
      // The first root, as the seed wakes up
      { d: 'M100 212 Q99 218 101 224', paint: 'root', origin: [100, 212], grow: [sow[0] + (sow[1] - sow[0]) * 0.45, sow[1]], fade: gw(0.15, 0.25) },
    ]
  }
  // A cutting or a side shoot: a short stem with two leaves, pushed into the soil.
  return [
    { d: `${curve([100, 206], 4, 30, 1)} ${leaf([101, 182], 50, 12, 8)} ${leaf([101, 182], -45, 11, 7)}`, paint: 'stem', origin: [100, 206], grow: [sow[0], sow[0] + 0.02], fade: gw(0.08, 0.2) },
    { d: 'M100 206 Q97 214 95 222 M100 206 Q103 214 106 220', paint: 'root', origin: [100, 206], grow: [sow[0] + (sow[1] - sow[0]) * 0.4, sow[1]], fade: gw(0.15, 0.25) },
  ]
}

const roots: PlantPart = {
  d: 'M100 200 Q96 212 90 228 M100 200 Q103 214 108 230 M100 202 Q92 208 82 212 M100 202 Q110 207 118 210',
  paint: 'root',
  origin: BASE,
  grow: gw(0.02, 0.35),
}

const basket: PlantPart = { d: BASKET_PATH, paint: 'basket', origin: [170, 207], grow: [CUT[0], CUT[0] + 0.03] }
/** The harvest, landing in the basket. */
const inBasket = (d: string, paint: Paint = 'leaf'): PlantPart => ({ d, paint, origin: [170, 190], grow: [CUT[0] + 0.03, CUT[1]] })
const cut = (at: Pt): PlantPart => ({ d: cutMark(at), paint: 'mark', origin: at, grow: [CUT[0] + 0.02, CUT[1] * 0.7 + CUT[0] * 0.3] })

/* ------------------------------------------------------------------ */
/* Forms                                                               */
/* ------------------------------------------------------------------ */

function uprightHerb(): PlantDrawing {
  const stemLen = 128
  const parts: PlantPart[] = [{ d: curve(BASE, 0, stemLen, 3), paint: 'stem', origin: BASE, grow: gw(0.04, 0.75) }]
  // Seed leaves, gone once the true leaves take over
  parts.push({ d: `${leaf([100, 187], 70, 10, 9, 'round')} ${leaf([100, 187], -70, 10, 9, 'round')}`, paint: 'leaf', origin: [100, 187], grow: gw(0.03, 0.12), fade: gw(0.4, 0.55) })
  const pairs: [number, number, number, number][] = [
    // [fraction up the stem, length, width, angle]
    [0.2, 30, 20, 62],
    [0.36, 28, 18, 58],
    [0.52, 25, 16, 52],
    [0.68, 21, 14, 46],
    [0.84, 16, 11, 38],
  ]
  for (const [f, len, w, a] of pairs) {
    const at = along(BASE, 0, stemLen, 3, f)
    const win = gw(0.75 * f + 0.02, 0.75 * f + 0.24)
    const topPair = f > 0.8
    parts.push({ d: leaf(at, a, len, w), paint: 'leaf', origin: at, grow: win, fade: topPair ? CUT : undefined })
    parts.push({ d: leaf(at, -a, len * 0.95, w), paint: 'leaf', origin: at, grow: [win[0] + 0.01, win[1] + 0.01], fade: topPair ? CUT : undefined })
  }
  // Side shoots after pinching, each with a leaf pair
  for (const side of [-1, 1]) {
    const from = along(BASE, 0, stemLen, 3, 0.52)
    const len = 42
    parts.push({ d: curve(from, side * 34, len, -side * 3), paint: 'stem', origin: from, grow: gw(0.55, 0.82) })
    const tip = tipOf(from, side * 34, len)
    parts.push({ d: `${leaf(tip, side * 70, 15, 10)} ${leaf(tip, side * 10, 13, 9)}`, paint: 'leaf', origin: tip, grow: gw(0.68, 0.92), fade: CUT })
    parts.push({ d: spike(tip, side * 18, 18), paint: 'flower', origin: tip, grow: inReady(0.1, 0.45), fade: CUT })
    parts.push(cut(tip))
  }
  const top = tipOf(BASE, 0, stemLen)
  parts.push({ d: spike(top, 0, 26), paint: 'flower', origin: top, grow: inReady(0, 0.4), fade: CUT })
  parts.push(cut(along(BASE, 0, stemLen, 3, 0.86)))
  parts.push(basket, inBasket(`${curve([158, 190], 70, 30, -3)} ${leaf([168, 186], 20, 14, 10)} ${leaf([178, 185], 110, 13, 9)} ${leaf([163, 188], -20, 12, 8)}`))
  return {
    parts,
    anchors: { stem: along(BASE, 0, stemLen, 3, 0.3), leaf: place(along(BASE, 0, stemLen, 3, 0.36), 58, 0, 18), base: [100, 214], top },
  }
}

function spreadingHerb(): PlantDrawing {
  const parts: PlantPart[] = []
  const stems: [number, number, number][] = [
    [-42, 70, 8],
    [-18, 88, 5],
    [0, 96, -2],
    [18, 86, -5],
    [42, 68, -8],
  ]
  stems.forEach(([a, len, bend], i) => {
    const order = [2, 1, 3, 0, 4].indexOf(i)
    const s0 = 0.04 + order * 0.08
    parts.push({ d: curve(BASE, a, len, bend), paint: 'stem', origin: BASE, grow: gw(s0, s0 + 0.5) })
    for (const f of [0.35, 0.6, 0.85]) {
      const at = along(BASE, a, len, bend, f)
      const win = gw(s0 + 0.5 * f, s0 + 0.5 * f + 0.22)
      const fade = f > 0.8 ? CUT : undefined
      parts.push({ d: `${leaf(at, a + 60, 14, 11)} ${leaf(at, a - 60, 14, 11)}`, paint: 'leaf', origin: at, grow: win, fade })
    }
    parts.push(cut(along(BASE, a, len, bend, 0.75)))
  })
  // Runners creeping along the soil
  for (const side of [-1, 1]) {
    const from: Pt = [100 + side * 6, 199]
    parts.push({ d: curve(from, side * 86, 58, side * -4), paint: 'stem', origin: from, grow: gw(0.6, 0.9) })
    for (const f of [0.5, 0.95]) {
      const at = along(from, side * 86, 58, side * -4, f)
      parts.push({ d: `${leaf(at, -20 * side, 9, 7)} ${leaf(at, 25 * side, 8, 6)}`, paint: 'leaf', origin: at, grow: gw(0.72 + f * 0.1, 0.95) })
    }
  }
  parts.push(basket, inBasket(`${curve([156, 189], 75, 34, -2)} ${leaf([166, 186], 15, 12, 10)} ${leaf([176, 185], -15, 12, 10)} ${leaf([184, 186], 40, 10, 8)}`))
  return { parts, anchors: { stem: along(BASE, 0, 96, -2, 0.35), leaf: along(BASE, 18, 86, -5, 0.6), base: [100, 214], top: tipOf(BASE, 0, 96) } }
}

function grassClump(): PlantDrawing {
  const parts: PlantPart[] = [
    // The pale, thickened base of the stalks
    { d: 'M92 200 C91 190 92 178 95 170 L105 170 C108 178 109 190 108 200', paint: 'rhizome', origin: BASE, grow: gw(0.2, 0.7) },
  ]
  const blades: [number, number, number][] = [
    [-40, 118, -14],
    [-29, 140, -10],
    [-17, 152, -8],
    [-7, 162, -5],
    [2, 166, 4],
    [11, 160, 7],
    [21, 150, 10],
    [31, 138, 12],
    [41, 116, 15],
  ]
  blades.forEach(([a, len, bend], i) => {
    const order = Math.abs(i - 4)
    const from: Pt = [100 + a * 0.12, 175]
    const outer = i === 0 || i === blades.length - 1
    parts.push({ d: blade(from, a, len, bend, 6), paint: 'leaf', origin: from, grow: gw(0.04 + order * 0.07, 0.5 + order * 0.08), fade: outer ? CUT : undefined })
    if (outer) parts.push(cut([from[0], 196]))
  })
  parts.push(basket, inBasket('M152 192 L188 178 M153 196 L190 184 M154 188 L186 174', 'stem'))
  return { parts, anchors: { stem: [100, 182], leaf: place([100, 175], 11, 4, 90), base: [100, 214], top: [104, 12] } }
}

function rosette(): PlantDrawing {
  const parts: PlantPart[] = []
  const leaves: [number, number][] = [
    [-52, 76],
    [-39, 92],
    [-25, 104],
    [-11, 112],
    [2, 116],
    [15, 110],
    [28, 100],
    [41, 90],
    [54, 74],
  ]
  leaves.forEach(([a, len], i) => {
    const order = Math.abs(i - 4)
    const from: Pt = [100, 192]
    // Arching straps: each tip bends outwards and down, more for the outer leaves.
    const droop = Math.sign(a || 1) * (10 + Math.abs(a) * 0.85)
    const outer = i === 0 || i === leaves.length - 1
    parts.push({ d: blade(from, a, len, droop, 9, -0.25), paint: 'leaf', origin: from, grow: gw(0.04 + order * 0.08, 0.55 + order * 0.07), fade: outer ? CUT : undefined })
    if (outer) parts.push(cut(place(from, a, 0, 14)))
  })
  parts.push({ d: 'M94 200 C94 194 106 194 106 200', paint: 'stem', origin: BASE, grow: gw(0.1, 0.4) })
  parts.push(basket, inBasket('M152 190 C164 176 176 176 188 186 M154 194 C166 182 178 182 190 192', 'leaf'))
  return { parts, anchors: { stem: [100, 192], leaf: place([100, 192], 22, 20, 70), base: [100, 214], top: place([100, 192], 4, 0, 118) } }
}

function fruitingShrub(): PlantDrawing {
  const parts: PlantPart[] = []
  const trunk = 92
  parts.push({ d: curve(BASE, 0, trunk, 2), paint: 'stem', origin: BASE, grow: gw(0.04, 0.55) })
  parts.push({ d: `${leaf([100, 186], 65, 11, 8)} ${leaf([100, 186], -65, 11, 8)}`, paint: 'leaf', origin: [100, 186], grow: gw(0.03, 0.12), fade: gw(0.4, 0.55) })
  const branches: [number, number, number, number][] = [
    // [fraction up the trunk, angle, length, when it grows (g)]
    [0.45, -40, 44, 0.3],
    [0.5, 38, 46, 0.34],
    [0.75, -26, 40, 0.45],
    [0.8, 24, 42, 0.5],
    [1, -8, 30, 0.6],
    [1, 12, 28, 0.62],
  ]
  for (const [f, a, len, at] of branches) {
    const from = along(BASE, 0, trunk, 2, f)
    parts.push({ d: curve(from, a, len, a > 0 ? -3 : 3), paint: 'stem', origin: from, grow: gw(at, at + 0.25) })
    for (const lf of [0.45, 0.85]) {
      const lp = along(from, a, len, a > 0 ? -3 : 3, lf)
      parts.push({ d: `${leaf(lp, a + 55, 16, 8, 'lance')} ${leaf(lp, a - 55, 15, 8, 'lance')}`, paint: 'leaf', origin: lp, grow: gw(at + 0.12 + lf * 0.1, at + 0.3 + lf * 0.1) })
    }
    const tip = tipOf(from, a, len)
    parts.push({ d: flower(place(tip, a, 6, -2), 4), paint: 'flower', origin: tip, grow: gw(0.8, 0.88), fade: inReady(0.05, 0.3) })
    parts.push({ d: pod(place(tip, a, 0, 1), a * 0.3, 15, 5), paint: 'fruit', origin: tip, grow: inReady(0.05, 0.45), fade: CUT })
  }
  parts.push(basket, inBasket(`${pod([160, 190], 70, 14, 5)} ${pod([168, 186], 40, 15, 5)} ${pod([176, 190], 100, 14, 5)} ${pod([182, 186], 60, 13, 5)}`, 'fruit'))
  return { parts, anchors: { stem: along(BASE, 0, trunk, 2, 0.3), leaf: along(along(BASE, 0, trunk, 2, 0.5), 38, 46, -3, 0.45), base: [100, 214], top: tipOf(BASE, 0, trunk) } }
}

function broadleafRhizome(): PlantDrawing {
  const parts: PlantPart[] = []
  const shoots: [number, number, number][] = [
    [-30, 50, 0.1],
    [-9, 72, 0.02],
    [12, 66, 0.06],
    [32, 46, 0.18],
  ]
  for (const [a, stalk, at] of shoots) {
    const bend = a > 0 ? -3 : 3
    parts.push({ d: curve(BASE, a * 0.6, stalk, bend), paint: 'stem', origin: BASE, grow: gw(at, at + 0.35) })
    const top = tipOf(BASE, a * 0.6, stalk)
    const blade1 = leaf(top, a, 72, 30, 'lance')
    parts.push({ d: blade1, paint: 'leaf', origin: top, grow: gw(at + 0.2, at + 0.6) })
    // At ready the leaves yellow and dry: a dry copy fades in over the green one.
    parts.push({ d: blade1, paint: 'leaf-dry', origin: top, grow: inReady(0.6, 0.95) })
  }
  // The rhizome swells underground, then is lifted at harvest
  parts.push({
    d: `${rhizome([76, 214], [124, 212], 12)} ${rhizome([84, 222], [108, 226], 8)} ${rhizome([110, 218], [130, 226], 7)}`,
    paint: 'rhizome',
    origin: [100, 216],
    grow: gw(0.45, 0.98),
    fade: CUT,
  })
  parts.push(basket, inBasket(`${rhizome([152, 190], [182, 186], 9)} ${rhizome([160, 182], [188, 180], 7)}`, 'rhizome'))
  return { parts, anchors: { stem: along(BASE, -5, 72, 3, 0.45), leaf: place(tipOf(BASE, 7, 66), 12, 0, 40), base: [100, 218], top: place(tipOf(BASE, -5, 72), -9, 0, 72) } }
}

function leafyVine(): PlantDrawing {
  const parts: PlantPart[] = []
  const stems: [number, number, number, number][] = [
    [-28, 98, 12, 0.08],
    [-8, 122, 6, 0.02],
    [12, 116, -8, 0.05],
    [30, 94, -12, 0.12],
  ]
  for (const [a, len, bend, at] of stems) {
    parts.push({ d: curve(BASE, a, len, bend), paint: 'stem', origin: BASE, grow: gw(at, at + 0.55) })
    ;[0.3, 0.5, 0.7, 0.9].forEach((f, i) => {
      const lp = along(BASE, a, len, bend, f)
      const side = i % 2 ? 1 : -1
      parts.push({ d: leaf(lp, a + side * 52, 24, 13, 'arrow'), paint: 'leaf', origin: lp, grow: gw(at + 0.55 * f, at + 0.55 * f + 0.22), fade: f > 0.4 ? CUT : undefined })
    })
    parts.push(cut(along(BASE, a, len, bend, 0.15)))
  }
  parts.push(basket, inBasket(`${curve([154, 192], 72, 36, -3)} ${leaf([166, 188], 20, 15, 9, 'arrow')} ${leaf([178, 186], -25, 14, 9, 'arrow')}`))
  return { parts, anchors: { stem: along(BASE, -8, 122, 6, 0.3), leaf: along(BASE, 12, 116, -8, 0.5), base: [100, 214], top: tipOf(BASE, -8, 122) } }
}

const FORMS: Record<PlantForm, () => PlantDrawing> = {
  'upright-herb': uprightHerb,
  'spreading-herb': spreadingHerb,
  'grass-clump': grassClump,
  rosette,
  'fruiting-shrub': fruitingShrub,
  'broadleaf-rhizome': broadleafRhizome,
  'leafy-vine': leafyVine,
}

const cache = new Map<string, PlantDrawing>()

/** The drawing for a crop: its form's parts plus how it starts (seed, cutting or rhizome). */
export function plantDrawing(crop: Pick<Crop, 'id' | 'form' | 'careGuide'>): PlantDrawing {
  const key = `${crop.form}|${crop.careGuide.startFrom}`
  let drawing = cache.get(key)
  if (!drawing) {
    const body = FORMS[crop.form]()
    drawing = { parts: [...start(crop.careGuide.startFrom, crop.form), roots, ...body.parts], anchors: body.anchors }
    cache.set(key, drawing)
  }
  return drawing
}
