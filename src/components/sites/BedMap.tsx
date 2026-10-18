import { useId, useMemo, useState } from 'react'
import { failureCauseOptions } from '../../data'
import { useLogs } from '../../hooks/useLogs'
import { formatDate } from '../../lib/dates'
import { formatNumber } from '../../lib/format'
import { cropName } from '../../lib/lookups'
import { bedHistory, bedStatuses, growthStage, growthTimelines, netLoss, type GrowthStage } from '../../lib/metrics'
import type { Site } from '../../types'
import PlantTopView from '../illustrations/PlantTopView'
import GrowthTimeline from './GrowthTimeline'

const ICON_SIZE: Record<GrowthStage, string> = {
  seedling: 'size-3',
  growing: 'size-4',
  ready: 'size-5',
  harvesting: 'size-5',
}
/** Most plant icons drawn in one bed; the count is written out as well. */
const MAX_ICONS = 24

type Status = 'growing' | 'cropping' | 'ready' | 'loss' | 'empty'
// The terracotta accent is kept for the one thing to act on: a first harvest that is due.
const STATUS: Record<Status, { label: string; icon: string; tile: string }> = {
  growing: { label: 'Growing', icon: 'text-brand-500', tile: 'bg-brand-50' },
  cropping: { label: 'Being harvested', icon: 'text-brand-800', tile: 'bg-brand-100' },
  ready: { label: 'First harvest due', icon: 'text-accent', tile: 'bg-accent-bg' },
  loss: { label: 'Losses in the last 2 weeks', icon: 'text-attention', tile: 'bg-attention-bg' },
  empty: { label: 'Nothing growing', icon: 'text-ink-muted', tile: 'bg-surface' },
}

/**
 * Top-down map of a site's beds. Bed width follows its area; plant icons grow with the crop's stage and
 * are coloured by status. Selecting a bed shows its plantings and losses.
 */
export default function BedMap({ site, asOf }: { site: Site; asOf: string }) {
  const id = useId()
  const { logs } = useLogs()
  const [selected, setSelected] = useState<string | null>(null)

  const beds = useMemo(
    () =>
      bedStatuses(logs, site, asOf).map((status) => {
        const stage = growthStage(status, asOf)
        const history = bedHistory(logs, status.bed.id, asOf)
        const kind: Status = !stage
          ? 'empty'
          : history.recentLoss
            ? 'loss'
            : stage === 'ready'
              ? 'ready'
              : stage === 'harvesting'
                ? 'cropping'
                : 'growing'
        return { status, stage, history, kind }
      }),
    [logs, site, asOf],
  )
  const timelines = useMemo(() => growthTimelines(logs, [site.id], asOf), [logs, site.id, asOf])
  const active = beds.find((b) => b.status.bed.id === selected)
  const activeTimeline = active ? timelines.find((t) => t.status.bed.id === active.status.bed.id) : undefined

  if (beds.length === 0) return <p className="bg-sunken p-4 text-ink-muted">No beds recorded for this site.</p>

  return (
    <div>
      <div className="rounded-2xl bg-sunken p-3" role="group" aria-label={`Map of the beds at ${site.name}`}>
        <ul className="flex flex-wrap gap-2">
          {beds.map(({ status, stage, kind }) => {
            const { bed, planting, plantsAlive } = status
            const icons = Math.min(plantsAlive, MAX_ICONS)
            const isSelected = selected === bed.id
            return (
              <li key={bed.id} style={{ flex: `${Math.max(1, bed.areaSqm ?? 1)} 1 9rem` }}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-controls={`${id}-detail`}
                  onClick={() => setSelected(isSelected ? null : bed.id)}
                  className={`flex h-full min-h-32 w-full flex-col rounded-xl p-2.5 text-left transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 ${STATUS[kind].tile} ${
                    kind === 'empty' ? 'border-2 border-dashed border-line-strong' : 'shadow-card'
                  } ${isSelected ? 'ring-3 ring-ink ring-offset-2 ring-offset-sunken' : ''}`}
                >
                  <span className="text-xs font-semibold">{bed.label}</span>
                  <span className="text-xs text-ink-muted">
                    {planting ? `${cropName(planting.cropId)} · ${plantsAlive} plants` : 'Nothing growing'} · {bed.areaSqm} m²
                  </span>
                  <span className={`mt-2 flex flex-1 flex-wrap content-start gap-0.5 ${STATUS[kind].icon}`} aria-hidden>
                    {stage &&
                      Array.from({ length: icons }, (_, i) => <PlantTopView key={i} className={ICON_SIZE[stage]} />)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted" aria-label="Map key">
        {(Object.keys(STATUS) as Status[]).map((k) => (
          <li key={k} className="inline-flex items-center gap-1.5">
            <PlantTopView className={`size-4 ${STATUS[k].icon}`} />
            {STATUS[k].label}
          </li>
        ))}
        <li>Bigger icons = further along</li>
      </ul>

      <div id={`${id}-detail`} aria-live="polite" className="mt-4">
        {active ? (
          <div className="rounded-2xl bg-surface p-5 shadow-card">
            <h3 className="font-display text-2xl font-medium">{active.status.bed.label}</h3>
            <p className="text-sm text-ink-muted">
              {active.status.bed.areaSqm} m² · {active.history.harvests} harvests,{' '}
              {formatNumber(active.history.harvestKg, 1)} kg in all
            </p>
            {activeTimeline && (
              <div className="mt-5">
                <GrowthTimeline timeline={activeTimeline} />
              </div>
            )}
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="font-semibold">Plantings</h4>
                {active.history.plantings.length === 0 ? (
                  <p className="text-sm text-ink-muted">None logged.</p>
                ) : (
                  <ul className="mt-1 space-y-1 text-sm">
                    {active.history.plantings.slice(0, 6).map((p) => (
                      <li key={p.id}>
                        <span className="font-medium">{cropName(p.cropId)}</span> · {p.quantity} plants ·{' '}
                        {p.source === 'setup' ? 'set by hand' : formatDate(p.date)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="font-semibold">Losses</h4>
                {active.history.losses.length === 0 ? (
                  <p className="text-sm text-ink-muted">None logged.</p>
                ) : (
                  <ul className="mt-1 space-y-1 text-sm">
                    {active.history.losses.slice(0, 6).map((f) => (
                      <li key={f.id}>
                        <span className="font-medium">
                          {f.estimatedLossPlants}
                          {f.plantsInBed ? ` of ${f.plantsInBed}` : ''} lost
                        </span>
                        {f.recoveredPlants ? `, ${f.recoveredPlants} recovered` : ''} ·{' '}
                        {failureCauseOptions.find((c) => c.value === f.cause)?.label} · {formatDate(f.date)}
                        {netLoss(f) === 0 && ' (all recovered)'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">Select a bed to see its plantings and losses.</p>
        )}
      </div>
    </div>
  )
}
