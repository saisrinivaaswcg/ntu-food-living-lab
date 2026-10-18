import { problemCauseOptions, problemStatusLabels } from '../../data'
import { formatDate } from '../../lib/dates'
import { cropName } from '../../lib/lookups'
import type { ProblemEntry } from '../../types'

export default function ProblemCard({ problem }: { problem: ProblemEntry }) {
  const cause = problemCauseOptions.find((c) => c.value === problem.cause)?.label ?? problem.cause
  const open = problem.status === 'open'
  return (
    <article className="h-full rounded-2xl bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="min-w-0 font-display text-xl leading-snug font-medium">{problem.title}</h4>
        <span
          className={`shrink-0 rounded-sm px-2 py-0.5 text-xs font-semibold ${
            open ? 'bg-attention-bg text-attention' : 'bg-brand-100 text-brand-800'
          }`}
        >
          {problemStatusLabels[problem.status]}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        {formatDate(problem.date)} · {problem.cropId ? cropName(problem.cropId) : 'Whole site'} · {cause}
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="font-semibold">Symptoms</dt>
          <dd className="text-ink-muted">{problem.symptoms}</dd>
        </div>
        <div>
          <dt className="font-semibold">Action taken</dt>
          <dd className="text-ink-muted">{problem.actionTaken}</dd>
        </div>
        <div>
          <dt className="font-semibold">Outcome</dt>
          <dd className="text-ink-muted">{problem.outcome}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-ink-muted">Reported by {problem.reportedBy}</p>
      {problem.tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Tags">
          {problem.tags.map((tag) => (
            <li key={tag} className="rounded-md bg-canvas px-2 py-0.5 text-xs text-ink-muted">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
