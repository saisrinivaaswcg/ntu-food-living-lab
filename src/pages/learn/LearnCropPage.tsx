import { useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import CropJourney from '../../components/learn/CropJourney'
import CropJourneyStill from '../../components/learn/CropJourneyStill'
import CropTroubles from '../../components/learn/CropTroubles'
import GrowWithUs from '../../components/learn/GrowWithUs'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import { problemLog } from '../../data'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useTasks } from '../../hooks/useTasks'
import { findCrop } from '../../lib/lookups'
import { paths } from '../../lib/paths'
import { cropAtNtu, cropsCurrentlyGrowing, cropTroubles } from '../../lib/metrics'
import NotFoundPage from '../NotFoundPage'

/** One crop's growing journey: scroll from seed to harvest, then what went wrong and how to join in. */
export default function LearnCropPage() {
  const { cropId } = useParams()
  const crop = findCrop(cropId)
  const reduce = useReducedMotion()
  const { logs, sites } = useLogs()
  const { tasks, claims } = useTasks()
  usePageTitle(crop ? `Grow ${crop.name}` : 'Crop not found')

  const problems = useMemo(() => problemLog.filter((p) => p.cropId === crop?.id), [crop])
  const atNtu = useMemo(() => (crop ? cropAtNtu(logs, crop.id, problems.length) : null), [logs, crop, problems])
  const troubles = useMemo(() => (crop ? cropTroubles(logs, problemLog, crop.id) : []), [logs, crop])
  const growingSites = useMemo(
    () => (crop ? sites.filter((s) => cropsCurrentlyGrowing(logs, s).includes(crop.id)) : []),
    [logs, sites, crop],
  )

  if (!crop || !atNtu) {
    return (
      <NotFoundPage
        title="Crop not found"
        message={`There is no growing guide for "${cropId ?? ''}". Pick a crop from Learn to grow.`}
      />
    )
  }

  const growingAt = growingSites.map((s) => s.shortName)
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-3 lg:px-8">
        <Breadcrumbs items={[{ label: 'Learn', to: paths.learn }, { label: crop.name }]} className="mb-0" />
      </div>
      {reduce ? (
        <CropJourneyStill crop={crop} atNtu={atNtu} growingAt={growingAt} />
      ) : (
        <CropJourney crop={crop} atNtu={atNtu} growingAt={growingAt} />
      )}
      <CropTroubles crop={crop} troubles={troubles} />
      <GrowWithUs crop={crop} sites={growingSites} tasks={tasks} claims={claims} />
    </>
  )
}
