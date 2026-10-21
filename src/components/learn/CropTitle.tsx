import { propagationOptions } from '../../data'
import { BEGINNER_RATING_LABELS, type CropAtNtu } from '../../lib/metrics'
import type { Crop } from '../../types'

interface Props {
  crop: Crop
  atNtu: CropAtNtu
  growingAt: string[]
  /** Tighter, for the phone's half of the split */
  compact?: boolean
}

/** The crop's title, names and the four facts a beginner asks first. */
export default function CropTitle({ crop, atNtu, growingAt, compact = false }: Props) {
  const startFrom = propagationOptions.find((p) => p.value === crop.careGuide.startFrom)?.label ?? crop.careGuide.startFrom
  const facts = [
    { label: 'First harvest', value: `About ${crop.daysToFirstHarvest} days` },
    { label: 'Light', value: crop.careGuide.light },
    { label: 'Start from', value: startFrom === 'Seedling' ? 'A side shoot' : startFrom },
    { label: 'At NTU', value: BEGINNER_RATING_LABELS[atNtu.rating] },
  ]
  return (
    <div>
      <p className="text-sm font-semibold text-brand-700">Learn to grow</p>
      <h1 className={`mt-1 font-display font-medium ${compact ? 'text-4xl' : 'text-display'}`}>{crop.name}</h1>
      <p className="mt-1 text-ink-muted">
        {crop.localName && <>{crop.localName} · </>}
        <i>{crop.scientificName}</i>
      </p>
      <p className={`mt-3 max-w-md text-ink ${compact ? 'text-base' : 'text-lg lg:text-xl'}`}>{crop.careGuide.summary}</p>
      <dl className={`mt-4 grid max-w-md grid-cols-2 gap-x-4 border-t border-line pt-3 ${compact ? 'gap-y-2 text-sm' : 'gap-y-3'}`}>
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="text-xs text-ink-muted">{f.label}</dt>
            <dd className="font-semibold">{f.value}</dd>
          </div>
        ))}
      </dl>
      {growingAt.length > 0 && !compact && (
        <p className="mt-4 text-sm text-ink-muted">Growing now at {growingAt.join(', ')}.</p>
      )}
    </div>
  )
}
