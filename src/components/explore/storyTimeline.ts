/**
 * The home story's timeline, layout and copy (docs/scrollcraft/builds/home-story/BRIEF.md). One number,
 * t (0 to 1), runs over the pinned travel; every card, note and outcome reads it. Scene 2 (the peak)
 * gets the most room. Desk positions are offsets from the desk's centre in container units (cqw/cqh), so
 * the same choreography fits a 360px phone and a 1440px screen.
 */
import { useMemo } from 'react'
import { siteImages, type ImageSlot } from '../../data'
import { useLogs } from '../../hooks/useLogs'
import { formatShortDate } from '../../lib/dates'
import { formatNumber } from '../../lib/format'
import { cropName } from '../../lib/lookups'
import { latestHarvestBySite } from '../../lib/metrics'
import type { Site, SiteId } from '../../types'

/** Viewport-heights of scroll while the desk is pinned. With the stage itself the section is ~1.9 tall. */
export const STORY_TRAVEL_VH = 0.9

export type Window = [number, number]

/** Beats in t. Scenes: notebooks 0–0.25, record 0.25–0.7 (peak), value 0.7–1. */
export const BEATS = {
  /** The notes drift away from their cards */
  drift: [0.02, 0.26] as Window,
  /** Cards straighten and slide into the record's rows */
  collate: [0.24, 0.5] as Window,
  /** The record card appears behind them */
  frame: [0.3, 0.46] as Window,
  /** The notes slide into the rows and fade, the rows' log entries arrive */
  notesIn: [0.3, 0.5] as Window,
  rewrite: [0.42, 0.56] as Window,
  /** The forest-green thread draws down through the thumbnails */
  thread: [0.44, 0.64] as Window,
  /** The record opens into the three outcomes */
  open: [0.7, 0.82] as Window,
  outcome: (i: number): Window => [0.72 + i * 0.04, 0.86 + i * 0.04],
}

/** Scene copy cues: [fade in from, fully in, start out, fully out]. */
export const CUES: [number, number, number, number][] = [
  [-1, 0, 0.21, 0.26],
  [0.25, 0.3, 0.65, 0.7],
  [0.7, 0.75, 2, 3],
]

/** The outcomes take clicks once they are this far in. */
export const OUTCOMES_LIVE_AT = 0.8
/** Where focusing an outcome link scrolls to, so keyboard users see what they're on. */
export const OUTCOMES_FOCUS_AT = 0.97

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const progressIn = (t: number, [a, b]: Window) => clamp01((t - a) / (b - a))
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)

/** Scene 1: each card's centre (cqw, cqh) and tilt, its note's spot on the card's outer corner, and where that note drifts to. */
export const SCATTER = [
  { x: -24, y: -21, rotate: -6, note: { x: -27, y: -37, rotate: 7 }, drift: { x: -37, y: -45, rotate: 16 } },
  { x: 24, y: -18, rotate: 5, note: { x: 28, y: -34, rotate: -6 }, drift: { x: 39, y: -43, rotate: -15 } },
  { x: -23, y: 20, rotate: 4, note: { x: -27, y: 43, rotate: -5 }, drift: { x: -39, y: 51, rotate: -14 } },
  { x: 25, y: 22, rotate: -5, note: { x: 28, y: 45, rotate: 6 }, drift: { x: 40, y: 52, rotate: 15 } },
]

/**
 * The record card's geometry, in rem, matched by the classes in StoryRecord: a header, then one row per
 * site with a thumbnail on the left. Card targets are computed from these.
 */
export const RECORD = {
  width: 'min(92cqw, 28rem)',
  header: 2.75,
  row: 3.75,
  pad: 0.75,
  thumb: 2.75,
}

/** Total height of the record card for n rows, in rem. */
export const recordHeight = (rows: number) => RECORD.header + rows * RECORD.row + RECORD.pad
/** Vertical centre of row i, from the desk's centre, in rem. */
export const rowCentre = (i: number, rows: number) => -recordHeight(rows) / 2 + RECORD.header + RECORD.row * (i + 0.5)
/** Horizontal centre of the thumbnails, from the desk's centre, as CSS. */
export const THUMB_X = `(${RECORD.width} / -2 + ${RECORD.pad + RECORD.thumb / 2}rem)`
/** Horizontal centre of a note laid over a row's text, from the desk's centre, as CSS. */
export const ROW_TEXT_X = `(${RECORD.width} / -2 + ${RECORD.pad * 2 + RECORD.thumb + 4.25}rem)`

/** The three scenes' words, shared by the pinned and still versions. */
export const SCENES = [
  {
    title: 'Four gardens, four notebooks',
    text: 'NTU already grows food in four places. Each committee kept its own notes, and at every handover some of them walked out the door.',
  },
  {
    title: 'One shared record',
    text: 'Now every garden logs the same way, in one place. Each scribble becomes a row anyone can read.',
  },
  {
    title: 'Lasting value',
    text: 'One record that keeps giving back, long after this committee graduates.',
  },
]

/** What each committee scribbled before the shared record (illustrative, not from the logs). */
const NOTES: Record<string, string> = {
  'yunnan-culinary-trail': 'turmeric bed 4 lifted… 2 kg?? scale missing',
  'hall-12-herb-spice': 'basil box GREAT. who waters Tues??',
  'earthlink-yunnan-corner': 'kangkong died in Aug. drought? ask Ken',
  'community-herb-garden': 'pandan cuttings → swap. key w/ seniors',
}

export interface StoryEntry {
  site: Site
  slot: ImageSlot
  note: string
  /** The site's latest harvest as a log row, or null when it has none */
  row: { date: string; crop: string; kg: string } | null
}

/** The four photographed gardens, each with its old note and its latest harvest from the logs. */
export function useStoryEntries(): StoryEntry[] {
  const { sites, logs } = useLogs()
  return useMemo(() => {
    const latest = latestHarvestBySite(logs)
    return (Object.keys(siteImages) as SiteId[]).flatMap((id) => {
      const site = sites.find((s) => s.id === id)
      if (!site) return []
      const h = latest.get(id)
      const row = h ? { date: formatShortDate(h.date), crop: cropName(h.cropId), kg: `${formatNumber(h.weightKg, 2)} kg` } : null
      return [{ site, slot: siteImages[id], note: NOTES[id] ?? '', row }]
    })
  }, [sites, logs])
}
