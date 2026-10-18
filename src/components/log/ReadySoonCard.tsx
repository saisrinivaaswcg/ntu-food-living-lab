import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatShortDate } from '../../lib/dates'
import { cropName, siteName } from '../../lib/lookups'
import type { GrowthTimeline } from '../../lib/metrics'
import PlantSprite from '../illustrations/PlantSprite'

function when(t: GrowthTimeline): string {
  if (t.stage === 'harvesting') return t.lastHarvest ? `Last picked ${formatShortDate(t.lastHarvest)}` : 'Cropping now'
  if (t.daysToExpected === null) return 'Growing'
  if (t.daysToExpected < 0) return `${-t.daysToExpected} days overdue`
  if (t.daysToExpected === 0) return 'Due today'
  return `Due in ${t.daysToExpected} ${t.daysToExpected === 1 ? 'day' : 'days'}`
}

/** A bed worth harvesting soon. Tapping it opens the harvest form with site, bed and crop filled in. */
export default function ReadySoonCard({ timeline: t }: { timeline: GrowthTimeline }) {
  const planting = t.status.planting
  if (!planting) return null
  const href = `/log/harvest?site=${t.siteId}&bed=${encodeURIComponent(t.status.bed.id)}&crop=${planting.cropId}`
  return (
    <Link
      to={href}
      className="group flex h-full w-56 flex-col rounded-2xl bg-surface p-4 shadow-card transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
    >
      <span className="flex items-start justify-between gap-2">
        <PlantSprite progress={t.progress} stage={t.stage} animate={false} className="h-16 w-12 text-brand-700" />
        <span
          className={`rounded-sm px-1.5 py-0.5 text-xs font-semibold ${
            t.stage === 'harvesting' ? 'bg-brand-100 text-brand-800' : 'bg-accent-bg text-accent-strong'
          }`}
        >
          {when(t)}
        </span>
      </span>
      <span className="mt-2 font-display text-xl font-medium">{cropName(planting.cropId)}</span>
      <span className="text-sm text-ink-muted">
        {siteName(t.siteId, true)} · {t.status.bed.label}
      </span>
      <span className="mt-auto inline-flex min-h-12 items-center gap-1.5 pt-2 font-semibold">
        Log harvest
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  )
}
