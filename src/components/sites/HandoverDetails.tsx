import { issuePriorityOptions } from '../../data'
import type { HandoverRecord } from '../../types'
import StatusBadge from '../ui/StatusBadge'
import PeopleList from './PeopleList'

const priorityClass: Record<HandoverRecord['openIssues'][number]['priority'], string> = {
  high: 'bg-attention-bg text-attention',
  medium: 'bg-establishing-bg text-establishing',
  low: 'bg-dormant-bg text-dormant',
}

/** Everything in one handover record except the checklist. Headings start at `level`. */
export default function HandoverDetails({ record, level = 3 }: { record: HandoverRecord; level?: 3 | 4 }) {
  const H = level === 3 ? 'h3' : 'h4'
  const issues = issuePriorityOptions.flatMap((p) =>
    record.openIssues.filter((i) => i.priority === p.value).map((issue) => ({ issue, label: p.label })),
  )

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <H className="mb-2 font-semibold">Leads this term</H>
        <PeopleList people={record.incomingLeads} emptyText="No incoming leads recorded." />
        <p className="mt-3 text-sm text-ink-muted">
          Handed over by {record.outgoingLeads.map((p) => p.name).join(', ') || 'nobody recorded'}
        </p>
      </div>

      <div>
        <H className="mb-2 font-semibold">Site status</H>
        <StatusBadge status={record.siteStatus} />
        <p className="mt-2 text-sm">{record.statusSummary}</p>
      </div>

      <div className="md:col-span-2">
        <H className="mb-2 font-semibold">Open issues</H>
        {issues.length === 0 ? (
          <p className="text-sm text-ink-muted">No open issues at handover.</p>
        ) : (
          <ul className="space-y-2">
            {issues.map(({ issue, label }) => (
              <li key={issue.title} className="rounded-xl border border-line p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="min-w-0 font-semibold">{issue.title}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityClass[issue.priority]}`}>
                    {label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{issue.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <H className="mb-2 font-semibold">Contacts</H>
        <PeopleList people={record.contacts} emptyText="No contacts recorded." />
      </div>

      <div>
        <H className="mb-2 font-semibold">Lessons learnt</H>
        {record.lessonsLearnt.length === 0 ? (
          <p className="text-sm text-ink-muted">No lessons recorded.</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {record.lessonsLearnt.map((lesson) => (
              <li key={lesson}>{lesson}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
