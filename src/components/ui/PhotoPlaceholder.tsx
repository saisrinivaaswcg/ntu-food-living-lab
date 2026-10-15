import { ImageIcon } from 'lucide-react'

interface Props {
  alt: string
  /** Aspect-ratio classes; defaults to 16:9. */
  aspectClass?: string
}

/** Stand-in for a site photo. Labelled as a placeholder; the alt text describes the intended photo. */
export default function PhotoPlaceholder({ alt, aspectClass = 'aspect-video' }: Props) {
  return (
    <figure
      role="img"
      aria-label={`Photo placeholder: ${alt}`}
      className={`flex ${aspectClass} flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-4 text-center`}
    >
      <ImageIcon className="size-8 text-brand-600" aria-hidden />
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-700" aria-hidden>
        Photo placeholder
      </span>
      <span className="text-sm text-ink-muted" aria-hidden>
        {alt}
      </span>
    </figure>
  )
}
