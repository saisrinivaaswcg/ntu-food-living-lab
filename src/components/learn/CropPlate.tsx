import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BEGINNER_RATING_LABELS, type CropAtNtu } from '../../lib/metrics'
import { paths } from '../../lib/paths'
import type { Crop } from '../../types'
import GrowingPlant from './GrowingPlant'
import { PLATE_FRAME } from './journey'

/**
 * A specimen plate for the crop library: the plant drawn fully grown, and a museum label with the same
 * schema for every crop (name, botanical name, days to first harvest, light, NTU survival, rating).
 */
export default function CropPlate({ crop, atNtu, id }: { crop: Crop; atNtu: CropAtNtu; id: string }) {
  return (
    <article id={id} aria-labelledby={`${id}-name`} className="group scroll-mt-24">
      <Link to={paths.learnCrop(crop.id)} className="block">
        <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden border border-line bg-surface px-4 pt-4 transition-colors group-hover:border-ink">
          <GrowingPlant
            crop={crop}
            progress={PLATE_FRAME}
            className="h-[98%] w-auto transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
          />
        </div>
        <div className="mt-3">
          <h2 id={`${id}-name`} className="flex items-center justify-between gap-3 font-display text-2xl font-medium">
            {crop.name}
            <ArrowRight className="size-5 shrink-0 text-brand-700 transition-transform group-hover:translate-x-1" aria-hidden />
          </h2>
          <p className="text-sm text-ink-muted">
            <i>{crop.scientificName}</i>
            {crop.localName && <> · {crop.localName}</>}
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-line pt-2 text-sm">
            <div>
              <dt className="sr-only">First harvest</dt>
              <dd>{crop.daysToFirstHarvest} days to first harvest</dd>
            </div>
            <div>
              <dt className="sr-only">Light</dt>
              <dd>{crop.careGuide.light}</dd>
            </div>
            <div>
              <dt className="sr-only">Survival at NTU</dt>
              <dd>{atNtu.survival === null ? 'Not grown at NTU yet' : `${Math.round(atNtu.survival * 100)}% survived at NTU`}</dd>
            </div>
            <div>
              <dt className="sr-only">Beginner rating</dt>
              <dd className="font-semibold text-brand-700">{BEGINNER_RATING_LABELS[atNtu.rating]}</dd>
            </div>
          </dl>
        </div>
      </Link>
    </article>
  )
}
