import { ChevronDown } from 'lucide-react'
import { protocolCategoryLabels } from '../../data'
import { formatDate } from '../../lib/dates'
import type { Protocol } from '../../types'
import EmptyState from '../ui/EmptyState'

/** Shared protocols as expandable sections. */
export default function ProtocolList({ protocols }: { protocols: Protocol[] }) {
  if (protocols.length === 0) {
    return <EmptyState title="No shared protocols yet" />
  }
  return (
    <ul className="divide-y divide-line rounded-card bg-surface shadow-card">
      {protocols.map((p) => (
        <li key={p.id}>
          <details className="group">
            <summary className="flex min-h-12 cursor-pointer list-none items-start gap-3 px-5 py-4 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-700 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-brand-800">{protocolCategoryLabels[p.category]}</span>
                <span className="block font-semibold">{p.title}</span>
                <span className="mt-0.5 block text-sm text-ink-muted">{p.summary}</span>
              </span>
              <ChevronDown className="mt-1 size-5 shrink-0 text-ink-muted transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="px-5 pb-5">
              <ol className="list-decimal space-y-2 pl-5 text-sm">
                {p.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="mt-3 text-sm text-ink-muted">
                Version {p.version} · last reviewed {formatDate(p.lastReviewed)}
              </p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  )
}
