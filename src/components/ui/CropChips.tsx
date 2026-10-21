import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cropName, findCrop } from '../../lib/lookups'
import { paths } from '../../lib/paths'
import type { CropId } from '../../types'

interface Props {
  cropIds: CropId[]
  emptyText: string
  /** Each chip opens the crop's growing guide (Learn). */
  linkToLearn?: boolean
}

export default function CropChips({ cropIds, emptyText, linkToLearn = false }: Props) {
  if (cropIds.length === 0) {
    return <p className="text-sm text-ink-muted">{emptyText}</p>
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {cropIds.map((id) =>
        linkToLearn && findCrop(id) ? (
          <li key={id}>
            <Link
              to={paths.learnCrop(id)}
              className="inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-sunken px-3 text-sm text-ink underline-offset-4 hover:bg-brand-50 hover:underline"
            >
              <BookOpen className="size-4 text-brand-700" aria-hidden />
              {cropName(id)}
              <span className="sr-only">: how to grow it</span>
            </Link>
          </li>
        ) : (
          <li key={id} className="rounded-sm bg-sunken px-2.5 py-1 text-sm text-ink">
            {cropName(id)}
          </li>
        ),
      )}
    </ul>
  )
}
