import { cropName } from '../../lib/lookups'
import type { CropId } from '../../types'

interface Props {
  cropIds: CropId[]
  emptyText: string
}

export default function CropChips({ cropIds, emptyText }: Props) {
  if (cropIds.length === 0) {
    return <p className="text-sm text-ink-muted">{emptyText}</p>
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {cropIds.map((id) => (
        <li key={id} className="rounded-sm bg-sunken px-2.5 py-1 text-sm text-ink">
          {cropName(id)}
        </li>
      ))}
    </ul>
  )
}
