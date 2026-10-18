import { formatNumber } from '../../lib/format'
import { cropName, getCrop } from '../../lib/lookups'
import type { CropYield } from '../../lib/metrics'
import type { CropId, CropNote } from '../../types'

interface Props {
  cropId: CropId
  note?: CropNote
  yields?: CropYield
}

function NoteList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

/** What grew at a site: yield range from harvest logs, plus the committee's notes. */
export default function CropCard({ cropId, note, yields }: Props) {
  const crop = getCrop(cropId)
  return (
    <article className="flex h-full flex-col gap-3 rounded-card bg-surface p-5 shadow-card">
      <header>
        <h3 className="text-lg font-semibold leading-snug">{cropName(cropId)}</h3>
        <p className="text-sm text-ink-muted">
          <i>{crop.scientificName}</i>
          {crop.localName && ` · ${crop.localName}`}
        </p>
      </header>

      {yields ? (
        <dl className="grid grid-cols-3 gap-2 rounded-xl bg-canvas p-3 text-sm">
          <div>
            <dt className="text-ink-muted">Per harvest</dt>
            <dd className="font-semibold tabular-nums">
              {formatNumber(yields.minKg, 2)}–{formatNumber(yields.maxKg, 2)} kg
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">Total</dt>
            <dd className="font-semibold tabular-nums">{formatNumber(yields.totalKg, 2)} kg</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Harvests</dt>
            <dd className="font-semibold tabular-nums">{yields.harvests}</dd>
          </div>
        </dl>
      ) : (
        <p className="rounded-xl bg-canvas p-3 text-sm text-ink-muted">No harvests logged for this crop here yet.</p>
      )}

      {note ? (
        <>
          <p className="text-sm">{note.summary}</p>
          <NoteList title="Problems hit" items={note.problems} />
          <NoteList title="What fixed them" items={note.fixes} />
          <NoteList title="Tips" items={note.tips ?? []} />
        </>
      ) : (
        <p className="text-sm text-ink-muted">No notes written for this crop yet.</p>
      )}
    </article>
  )
}
