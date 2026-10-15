import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface Crumb {
  label: string
  /** Omit for the current page (the last crumb). */
  to?: string
}

/** Trail starting at Explore. Pass the crumbs below the top level. */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ label: 'Explore', to: '/' }, ...items]
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-x-1 text-sm text-ink-muted">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
              {crumb.to && !last ? (
                <Link
                  to={crumb.to}
                  className="inline-flex min-h-12 items-center rounded px-1 underline-offset-4 hover:text-brand-700 hover:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="inline-flex min-h-12 items-center px-1 font-medium text-ink">
                  {crumb.label}
                </span>
              )}
              {!last && <ChevronRight className="size-4 text-ink-subtle" aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
