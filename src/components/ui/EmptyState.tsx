import { Inbox } from 'lucide-react'

/** Shown in place of a chart, table or list with nothing to display. */
export default function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line px-4 py-8 text-center">
      <Inbox className="size-6 text-ink-subtle" aria-hidden />
      <p className="font-medium text-ink">{title}</p>
      {detail && <p className="max-w-sm text-sm text-ink-muted">{detail}</p>}
    </div>
  )
}
