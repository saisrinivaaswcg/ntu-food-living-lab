import { ImageIcon } from 'lucide-react'
import type { PhotoRef } from '../../types'

/**
 * A harvest photo at any size: the uploaded image, or — for demo records, which have no real photo —
 * a labelled placeholder tile.
 */
export default function PhotoThumb({ photo, alt, large = false }: { photo: PhotoRef; alt: string; large?: boolean }) {
  if (photo.kind === 'upload') {
    return <img src={photo.dataUrl} alt={alt} className="size-full object-cover" loading="lazy" decoding="async" />
  }
  return (
    <span
      role="img"
      aria-label={`Photo placeholder (demo record): ${photo.caption}`}
      className="flex size-full flex-col items-center justify-center gap-1 bg-linear-to-br from-brand-100 to-brand-200 p-2 text-center text-brand-800"
    >
      <ImageIcon className={large ? 'size-8' : 'size-4'} aria-hidden />
      {large && (
        <span className="max-w-xs text-sm" aria-hidden>
          {photo.caption}
        </span>
      )}
    </span>
  )
}
