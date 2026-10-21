import { useMemo } from 'react'
import CropPlate from '../../components/learn/CropPlate'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import EmptyState from '../../components/ui/EmptyState'
import Reveal from '../../components/ui/Reveal'
import { DEMO_DATA_SHORT_NOTICE, problemLog } from '../../data'
import { useCrops } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { cropAtNtu } from '../../lib/metrics'

const RATING_ORDER = { easy: 0, moderate: 1, patient: 2 } as const

/**
 * The crop library: every crop NTU grows as a specimen plate, easiest first, each opening its growing
 * journey. An index of names at the top jumps to each plate.
 */
export default function LearnPage() {
  const crops = useCrops()
  usePageTitle('Learn to grow')
  const { logs } = useLogs()
  const library = useMemo(
    () =>
      crops
        .map((crop) => ({ crop, at: cropAtNtu(logs, crop.id, problemLog.filter((p) => p.cropId === crop.id).length) }))
        .sort((a, b) => RATING_ORDER[a.at.rating] - RATING_ORDER[b.at.rating] || a.crop.daysToFirstHarvest - b.crop.daysToFirstHarvest),
    [logs, crops],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Learn' }]} />
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-display font-medium">Learn to grow</h1>
          <p className="mt-3 text-lg text-ink-muted">
            Crops that do well on campus, easiest first. Each guide follows one plant from seed to harvest, with
            what NTU’s gardens learnt along the way. <span className="text-demo">{DEMO_DATA_SHORT_NOTICE}</span>
          </p>
        </div>
        <nav aria-label="Crops" className="max-w-xl">
          <ul className="flex flex-wrap gap-x-1 gap-y-0">
            {library.map(({ crop }) => (
              <li key={crop.id}>
                <a href={`#crop-${crop.id}`} className="inline-flex min-h-12 items-center px-2 font-semibold underline-offset-4 hover:underline">
                  {crop.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {library.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No crops yet" detail="Crops added to the platform appear here with a growing guide." />
        </div>
      ) : (
        <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {library.map(({ crop, at }, i) => (
            <Reveal as="li" key={crop.id} delay={Math.min(i, 3) * 0.06}>
              <CropPlate crop={crop} atNtu={at} id={`crop-${crop.id}`} />
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  )
}
