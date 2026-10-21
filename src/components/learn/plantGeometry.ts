/**
 * Shared parts for the botanical drawings: stems, leaves, blades and fruit as SVG path data, in a
 * 200 × 240 view box with the soil line at y = 200. Angles are in degrees from straight up, clockwise.
 */
export type Pt = [number, number]

export const SOIL_Y = 200
export const BASE: Pt = [100, SOIL_Y]

const RAD = Math.PI / 180
const r = (n: number) => Math.round(n * 10) / 10
const p = (pt: Pt) => `${r(pt[0])} ${r(pt[1])}`

/** A point `along` units in the direction `angle` from `from`, then `across` units to its right. */
export function place(from: Pt, angle: number, across: number, along: number): Pt {
  const a = angle * RAD
  return [from[0] + Math.sin(a) * along + Math.cos(a) * across, from[1] - Math.cos(a) * along + Math.sin(a) * across]
}

/** End point of a stem drawn by `curve`. */
export const tipOf = (from: Pt, angle: number, len: number): Pt => place(from, angle, 0, len)

/** A point a fraction of the way along a `curve` (close enough for attaching leaves). */
export function along(from: Pt, angle: number, len: number, bend: number, f: number): Pt {
  // Quadratic Bézier: B(f) = (1-f)²P0 + 2(1-f)f·C + f²·P2
  const c = place(from, angle, bend, len / 2)
  const e = tipOf(from, angle, len)
  const u = 1 - f
  return [u * u * from[0] + 2 * u * f * c[0] + f * f * e[0], u * u * from[1] + 2 * u * f * c[1] + f * f * e[1]]
}

/** A stem: one gentle curve, bent `bend` units sideways at its middle. */
export function curve(from: Pt, angle: number, len: number, bend = 0): string {
  return `M${p(from)} Q${p(place(from, angle, bend, len / 2))} ${p(tipOf(from, angle, len))}`
}

export type LeafShape = 'oval' | 'lance' | 'arrow' | 'round'

/** A leaf with its stalk end at `base`, pointing along `angle`. Closed path, with a midrib. */
export function leaf(base: Pt, angle: number, len: number, width: number, shape: LeafShape = 'oval'): string {
  const w = width / 2
  const tip = place(base, angle, 0, len)
  const rib = `M${p(base)} L${p(place(base, angle, 0, len * 0.82))}`
  if (shape === 'arrow') {
    // Arrowhead (kangkong): two backward lobes at the base.
    const lobeR = place(base, angle, w * 1.1, -len * 0.12)
    const lobeL = place(base, angle, -w * 1.1, -len * 0.12)
    return (
      `M${p(base)} L${p(lobeR)} C${p(place(base, angle, w * 1.2, len * 0.3))} ${p(place(base, angle, w * 0.5, len * 0.75))} ${p(tip)}` +
      ` C${p(place(base, angle, -w * 0.5, len * 0.75))} ${p(place(base, angle, -w * 1.2, len * 0.3))} ${p(lobeL)} Z ${rib}`
    )
  }
  const widest = shape === 'lance' ? 0.38 : shape === 'round' ? 0.45 : 0.32
  const k = shape === 'lance' ? 0.75 : shape === 'round' ? 1.25 : 1.1
  const r1 = place(base, angle, w * k, len * widest)
  const r2 = place(base, angle, w * (shape === 'round' ? 1 : 0.7), len * 0.85)
  const l1 = place(base, angle, -w * k, len * widest)
  const l2 = place(base, angle, -w * (shape === 'round' ? 1 : 0.7), len * 0.85)
  return `M${p(base)} C${p(r1)} ${p(r2)} ${p(tip)} C${p(l2)} ${p(l1)} ${p(base)} Z ${rib}`
}

/**
 * A long narrow leaf (lemongrass, pandan): base `width` wide, tip pushed `bend` units sideways. `arch`
 * (0 to 1) is how far along the bend the middle of the leaf already is: low values make it rise first
 * and then fall away, like an arching strap.
 */
export function blade(base: Pt, angle: number, len: number, bend: number, width = 5, arch = 0.55): string {
  const tip = place(base, angle, bend, len)
  const cR = place(base, angle, bend * arch + width * 0.55, len * 0.62)
  const cL = place(base, angle, bend * arch - width * 0.55, len * 0.62)
  return `M${p(place(base, angle, -width / 2, 0))} Q${p(cL)} ${p(tip)} Q${p(cR)} ${p(place(base, angle, width / 2, 0))}`
}

/** A small upright fruit (chilli padi) with its calyx at `base`. */
export function pod(base: Pt, angle: number, len: number, width = 5): string {
  const tip = place(base, angle, 0, len)
  const w = width / 2
  return (
    `M${p(place(base, angle, -w, len * 0.12))} C${p(place(base, angle, -w * 1.1, len * 0.6))} ${p(place(base, angle, -w * 0.4, len * 0.95))} ${p(tip)}` +
    ` C${p(place(base, angle, w * 0.4, len * 0.95))} ${p(place(base, angle, w * 1.1, len * 0.6))} ${p(place(base, angle, w, len * 0.12))} Z` +
    ` M${p(place(base, angle, -w * 1.2, len * 0.1))} Q${p(place(base, angle, 0, -len * 0.08))} ${p(place(base, angle, w * 1.2, len * 0.1))}`
  )
}

/** A five-petal flower seen from the front, centred on `c`. */
export function flower(c: Pt, size: number): string {
  let d = ''
  for (let i = 0; i < 5; i++) {
    const a = i * 72
    const tip = place(c, a, 0, size)
    d += `M${p(c)} Q${p(place(c, a, size * 0.45, size * 0.6))} ${p(tip)} Q${p(place(c, a, -size * 0.45, size * 0.6))} ${p(c)} `
  }
  return d.trim()
}

/** Little whorls up a flower spike (basil, mint). */
export function spike(base: Pt, angle: number, len: number): string {
  let d = curve(base, angle, len)
  for (let i = 1; i <= 4; i++) {
    const c = tipOf(base, angle, (len * i) / 4.3)
    const s = 3.2 - i * 0.4
    d += ` M${p(place(c, angle, -s, 0))} Q${p(place(c, angle, -s, s))} ${p(c)} Q${p(place(c, angle, s, s))} ${p(place(c, angle, s, 0))}`
  }
  return d
}

/** A knobbly rhizome lying on its side, from `from` to `to`, with fingers. */
export function rhizome(from: Pt, to: Pt, girth: number): string {
  const [x0, y0] = from
  const [x1, y1] = to
  const h = girth / 2
  const mx = (x0 + x1) / 2
  const my = (y0 + y1) / 2
  return (
    `M${r(x0)} ${r(y0)} C${r(x0)} ${r(y0 - h)} ${r(mx - 6)} ${r(my - h * 1.2)} ${r(mx)} ${r(my - h)}` +
    ` C${r(mx + 8)} ${r(my - h * 1.3)} ${r(x1)} ${r(y1 - h)} ${r(x1)} ${r(y1)}` +
    ` C${r(x1)} ${r(y1 + h)} ${r(mx + 6)} ${r(my + h * 1.1)} ${r(mx)} ${r(my + h)}` +
    ` C${r(mx - 8)} ${r(my + h * 1.2)} ${r(x0)} ${r(y0 + h)} ${r(x0)} ${r(y0)} Z` +
    ` M${r(mx - 4)} ${r(my - h * 0.2)} l2 1 M${r(mx + 6)} ${r(my + h * 0.1)} l2 -1`
  )
}

/** A woven basket on the soil, right of the plant: where the harvest goes. */
export const BASKET_PATH =
  'M146 186 L194 186 L189 207 Q170 211 151 207 Z M148 193 L192 193 M150 200 L190 200 M158 186 L160 208 M170 186 L170 210 M182 186 L180 208'

/** Ticks where a stem has been cut. */
export function cutMark(at: Pt): string {
  return `M${r(at[0] - 4)} ${r(at[1] + 2)} L${r(at[0] + 4)} ${r(at[1] - 2)}`
}
