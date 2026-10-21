import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import Illustration from '../components/ui/Illustration'
import { hasIllustration, illustrations } from '../data'
import { usePageTitle } from '../hooks/usePageTitle'

interface Props {
  title?: string
  message?: string
}

export default function NotFoundPage({
  title = 'Page not found',
  message = "We couldn't find that page. It may have moved, or the link may be mistyped.",
}: Props) {
  usePageTitle(title)
  return (
    <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8 lg:py-8">
      <Breadcrumbs items={[{ label: 'Not found' }]} />
      <div className="rounded-card bg-surface p-8 text-center shadow-card">
        {hasIllustration(illustrations.empty.notFound) ? (
          <div className="relative mx-auto size-40">
            <Illustration slot={illustrations.empty.notFound} sizes="10rem" />
          </div>
        ) : (
          <Compass className="mx-auto size-10 text-brand-600" aria-hidden />
        )}
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-ink-muted">{message}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="flex min-h-12 items-center justify-center rounded-xl bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800"
          >
            Back to Explore
          </Link>
          <Link
            to="/sites"
            className="flex min-h-12 items-center justify-center rounded-xl border border-line px-5 font-semibold text-ink hover:bg-canvas"
          >
            See all sites
          </Link>
        </div>
      </div>
    </div>
  )
}
