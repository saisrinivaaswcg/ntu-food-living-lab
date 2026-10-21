import { ChevronDown } from 'lucide-react'
import { useHandovers } from '../../hooks/useCommunity'
import { formatDate } from '../../lib/dates'
import type { Site } from '../../types'
import EmptyState from '../ui/EmptyState'
import HandoverChecklist from './HandoverChecklist'
import HandoverDetails from './HandoverDetails'

export default function HandoverTab({ site }: { site: Site }) {
  const records = useHandovers(site.id)
  const [latest, ...history] = records

  if (!latest) {
    return (
      <EmptyState
        title="No handover recorded yet"
        detail="The first committee handover for this site will appear here, with its checklist and lessons learnt."
      />
    )
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="current-handover-heading" className="rounded-2xl bg-surface p-5 shadow-card lg:p-8">
        <h2 id="current-handover-heading" className="font-display text-section font-medium">
          Current handover · {latest.term}
        </h2>
        <p className="mt-1 mb-5 text-sm text-ink-muted">
          Handed over {formatDate(latest.date)}
          {latest.lastUpdated && ` · last updated ${formatDate(latest.lastUpdated)}`}
        </p>
        <HandoverDetails record={latest} />
      </section>

      <section aria-labelledby="checklist-heading" className="rounded-2xl bg-surface p-5 shadow-card lg:p-8">
        <h2 id="checklist-heading" className="mb-3 font-display text-section font-medium">
          Handover checklist
        </h2>
        {/* key: a different record starts from its own saved ticks */}
        <HandoverChecklist key={latest.id} record={latest} />
      </section>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="mb-4 font-display text-section font-medium">
          Earlier handovers
        </h2>
        {history.length === 0 ? (
          <EmptyState title="No earlier handovers" detail="This is the first handover recorded for this site." />
        ) : (
          <ul className="space-y-3">
            {history.map((record) => {
              const done = record.checklist.filter((i) => i.done).length
              return (
                <li key={record.id}>
                  <details className="group rounded-2xl bg-surface shadow-card">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-5 py-4 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-700 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{record.term}</span>
                        <span className="block text-sm text-ink-muted">
                          {formatDate(record.date)} · {record.outgoingLeads.map((p) => p.name).join(', ')} to{' '}
                          {record.incomingLeads.map((p) => p.name).join(', ')}
                        </span>
                      </span>
                      <ChevronDown className="size-5 shrink-0 text-ink-muted transition-transform group-open:rotate-180" aria-hidden />
                    </summary>
                    <div className="border-t border-line px-5 py-5">
                      <HandoverDetails record={record} level={4} />
                      <p className="mt-6 text-sm text-ink-muted">
                        Checklist at handover: {done} of {record.checklist.length} done
                      </p>
                    </div>
                  </details>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
