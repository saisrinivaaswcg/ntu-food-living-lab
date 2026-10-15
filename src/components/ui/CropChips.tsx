import { cropName } from '../../lib/lookups'
import type { CropId } from '../../types'

interface Props {
  cropIds: CropId[]
  emptyText: string
}

export default function CropChips({ cropIds, emptyText }: Props) {
  if (cropIds.length === 0) {
    return <p className="text-sm text-ink-subtle">{emptyText}</p>
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {cropIds.map((id) => (
        <li key={id} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm text-brand-800">
          {cropName(id)}
        </li>
      ))}
    </ul>
  )
}
