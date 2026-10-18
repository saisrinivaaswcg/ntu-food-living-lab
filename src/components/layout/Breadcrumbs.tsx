import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface Crumb {
  label: string
  /** Omit for the current page (the last crumb). */
  to?: string
}

interface Props {
  items: Crumb[]
  /** Space below the trail; tighter on the log forms so they fit a phone screen. */
  className?: string
  /** White text, for a trail laid over a photo. */
  onDark?: boolean
}

/** Trail starting at Explore. Pass the crumbs below the top level. */
export default function Breadcrumbs({ items, className = 'mb-4', onDark = false }: Props) {
  const trail: Crumb[] = [{ label: 'Explore', to: '/' }, ...items]
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={`flex flex-wrap items-center gap-x-1 text-sm ${onDark ? 'text-white/85' : 'text-ink-muted'}`}>
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
              {crumb.to && !last ? (
                <Link
                  to={crumb.to}
                  className={`inline-flex min-h-12 items-center rounded-sm px-1 underline-offset-4 hover:underline ${onDark ? 'hover:text-white' : 'hover:text-brand-700'}`}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className={`inline-flex min-h-12 items-center px-1 font-medium ${onDark ? 'text-white' : 'text-ink'}`}>
                  {crumb.label}
                </span>
              )}
              {!last && <ChevronRight className={`size-4 ${onDark ? 'text-white/70' : 'text-ink-subtle'}`} aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
