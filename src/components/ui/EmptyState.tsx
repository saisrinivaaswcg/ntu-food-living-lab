import { Inbox } from 'lucide-react'
import { hasIllustration, type ImageSlot } from '../../data'
import Illustration from './Illustration'

/** Shown in place of a chart, table or list with nothing to display. Optionally with a small AI illustration. */
export default function EmptyState({ title, detail, illustration }: { title: string; detail?: string; illustration?: ImageSlot }) {
  const pictured = illustration && hasIllustration(illustration)
  return (
    <div className="flex items-start gap-3 bg-sunken px-4 py-5">
      {pictured ? (
        <span className="relative block size-20 shrink-0 sm:size-24">
          <Illustration slot={illustration} sizes="6rem" />
        </span>
      ) : (
        <Inbox className="mt-0.5 size-5 shrink-0 text-ink-muted" aria-hidden />
      )}
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {detail && <p className="mt-0.5 max-w-prose text-ink-muted">{detail}</p>}
      </div>
    </div>
  )
}
