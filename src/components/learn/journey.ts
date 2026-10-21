/**
 * The Learn journey's timeline. One number, t (0 to 1), runs from sowing to the end of the harvest act;
 * the plant drawing, the day ruler, the step text and the specimen tags all read it. Spans are in
 * viewport-heights of scroll: the harvest act (the peak) gets the most room. See
 * docs/scrollcraft/builds/learn-to-grow/BRIEF.md.
 */
import type { Crop, LearnStage } from '../../types'

export const LEARN_STAGES: { stage: LearnStage; label: string }[] = [
  { stage: 'sow', label: 'Sow' },
  { stage: 'seedling', label: 'Seedling' },
  { stage: 'growing', label: 'Growing' },
  { stage: 'ready', label: 'Ready' },
  { stage: 'harvest', label: 'Harvest' },
]

/** Viewport-heights of scroll per stage. Harvest is the peak, so it is the longest. */
// Sow also holds the title beat at the very start (the split's hero).
const SPANS: Record<LearnStage, number> = { sow: 1.3, seedling: 0.9, growing: 1.1, ready: 0.8, harvest: 2 }
export const JOURNEY_TRAVEL_VH = Object.values(SPANS).reduce((a, b) => a + b, 0)

/** [start, end] of each stage in t. */
export const STAGE_WINDOWS = (() => {
  let at = 0
  const out = {} as Record<LearnStage, [number, number]>
  for (const { stage } of LEARN_STAGES) {
    const len = SPANS[stage] / JOURNEY_TRAVEL_VH
    out[stage] = [at, at + len]
    at += len
  }
  return out
})()

const [HARVEST_START] = STAGE_WINDOWS.harvest
const HARVEST_LEN = 1 - HARVEST_START
/** Beats inside the harvest act (in t): the cut, the collapse of the split, then the tags. */
export const PEAK = {
  cut: [HARVEST_START + HARVEST_LEN * 0.04, HARVEST_START + HARVEST_LEN * 0.3] as [number, number],
  steps: [HARVEST_START, HARVEST_START + HARVEST_LEN * 0.42] as [number, number],
  collapse: [HARVEST_START + HARVEST_LEN * 0.36, HARVEST_START + HARVEST_LEN * 0.6] as [number, number],
  tags: [HARVEST_START + HARVEST_LEN * 0.55, HARVEST_START + HARVEST_LEN * 0.9] as [number, number],
}

/** The title greets at t = 0 and hands over to the Sow steps. */
export const TITLE_BEAT: [number, number] = [0, STAGE_WINDOWS.sow[1] * 0.42]

/** Vegetative growth runs from the start of the seedling stage to the end of Ready. */
const GROW_FROM = STAGE_WINDOWS.seedling[0]
const GROW_TO = STAGE_WINDOWS.ready[1]
/** Converts growth (g: 0 = just sprouted, 1 = fully grown) to journey t. */
export const g = (growth: number) => GROW_FROM + growth * (GROW_TO - GROW_FROM)

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const progressIn = (t: number, [a, b]: [number, number]) => clamp01((t - a) / (b - a))

/** The stage at journey progress t. */
export function stageAt(t: number): LearnStage {
  for (const { stage } of LEARN_STAGES) if (t < STAGE_WINDOWS[stage][1]) return stage
  return 'harvest'
}

/** The crop's day count at t: stage boundaries map to its real stage days, linear in between. */
export function dayAt(t: number, crop: Crop): number {
  const days = crop.careGuide.stageDays
  const marks: [number, number][] = [
    [0, 0],
    [STAGE_WINDOWS.seedling[0], days.seedling],
    [STAGE_WINDOWS.growing[0], days.growing],
    [STAGE_WINDOWS.ready[0], days.ready],
    [STAGE_WINDOWS.harvest[0], days.harvest],
    [1, days.harvest],
  ]
  for (let i = 1; i < marks.length; i++) {
    const [t0, d0] = marks[i - 1]
    const [t1, d1] = marks[i]
    if (t <= t1) return Math.round(d0 + (d1 - d0) * clamp01((t - t0) / (t1 - t0 || 1)))
  }
  return days.harvest
}

/** Part of the Ready window, 0 to 1, in journey t: fruit and flowers come early, drying leaves late. */
export const inReady = (from: number, to: number): [number, number] => {
  const [a, b] = STAGE_WINDOWS.ready
  return [a + (b - a) * from, a + (b - a) * to]
}

/** The crop library's plates: fully grown, flowering or fruiting, not yet drying off. */
export const PLATE_FRAME = inReady(0.5, 0.5)[0]

/** A still frame for each stage: the moment the drawing shows it best (used when motion is reduced). */
export const STAGE_FRAME: Record<LearnStage, number> = {
  sow: STAGE_WINDOWS.sow[1] * 0.9,
  seedling: STAGE_WINDOWS.seedling[1] - 0.01,
  growing: STAGE_WINDOWS.growing[1] - 0.01,
  ready: STAGE_WINDOWS.ready[1] - 0.005,
  harvest: 1,
}

/** "Days 7 to 18" for a stage, from the crop's own stage days. */
export function stageDays(crop: Crop, stage: LearnStage): string {
  const d = crop.careGuide.stageDays
  switch (stage) {
    case 'sow':
      return `Day 0 to ${d.seedling}`
    case 'seedling':
      return `Days ${d.seedling} to ${d.growing}`
    case 'growing':
      return `Days ${d.growing} to ${d.ready}`
    case 'ready':
      return `Days ${d.ready} to ${d.harvest}`
    case 'harvest':
      return `From day ${d.harvest}, again and again`
  }
}
