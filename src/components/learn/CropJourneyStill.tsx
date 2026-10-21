import { learnImages } from '../../data'
import type { CropAtNtu } from '../../lib/metrics'
import type { Crop } from '../../types'
import SlotImage from '../ui/SlotImage'
import CropTitle from './CropTitle'
import GrowingPlant from './GrowingPlant'
import { LEARN_STAGES, STAGE_FRAME } from './journey'
import { plantDrawing } from './plantDrawings'
import { TagKeys, TagList } from './SpecimenTags'
import { buildTags } from './tagData'
import StageCopy from './StageCopy'

/**
 * The journey with reduced motion: nothing moves, nothing pins. Five still plates, each beside its
 * steps, and the harvest plate with NTU's numbers keyed to it. Same content, same order.
 */
export default function CropJourneyStill({ crop, atNtu, growingAt }: { crop: Crop; atNtu: CropAtNtu; growingAt: string[] }) {
  const tags = buildTags(crop, atNtu)
  const { anchors } = plantDrawing(crop)
  const photo = learnImages[crop.id]
  return (
    <section aria-labelledby="journey-heading" className="mx-auto max-w-5xl px-4 lg:px-8">
      <div className="py-6">
        <CropTitle crop={crop} atNtu={atNtu} growingAt={growingAt} />
      </div>
      <h2 id="journey-heading" className="sr-only">
        Growing {crop.name}, from sowing to harvest
      </h2>
      <ol className="divide-y divide-line border-y border-line">
        {LEARN_STAGES.map(({ stage }) => (
          <li key={stage} className="grid items-center gap-6 py-8 sm:grid-cols-[14rem_1fr] lg:gap-12">
            <div className="relative mx-auto aspect-[200/240] w-40 sm:w-full">
              <GrowingPlant crop={crop} progress={STAGE_FRAME[stage]} className="h-full w-full" />
              {stage === 'harvest' && <TagKeys tags={tags} anchors={anchors} />}
            </div>
            <div>
              <StageCopy crop={crop} stage={stage} />
              {stage === 'ready' && photo && (
                <figure className="mt-4 max-w-md">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
                    <SlotImage slot={photo} caption="top" sizes="(min-width: 640px) 28rem, 90vw" />
                  </div>
                  <figcaption className="mt-1.5 text-sm text-ink-muted">{crop.careGuide.readySign}</figcaption>
                </figure>
              )}
              {stage === 'harvest' && (
                <div className="mt-6">
                  <h3 className="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">At NTU</h3>
                  <TagList tags={tags} />
                  <p className="mt-2 text-xs text-demo">From the platform’s logs (demonstration data).</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
