import { Inbox } from 'lucide-react'

/** Shown in place of a chart, table or list with nothing to display. */
export default function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3 bg-sunken px-4 py-5">
      <Inbox className="mt-0.5 size-5 shrink-0 text-ink-muted" aria-hidden />
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {detail && <p className="mt-0.5 max-w-prose text-ink-muted">{detail}</p>}
      </div>
    </div>
  )
}
