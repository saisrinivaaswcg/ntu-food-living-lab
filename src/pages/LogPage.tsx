import { ArrowRight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { logFormKinds } from '../components/log/logFormKinds'
import { useLogs } from '../hooks/useLogs'
import { usePageTitle } from '../hooks/usePageTitle'

export default function LogPage() {
  usePageTitle('Log')
  const { userLogCount } = useLogs()
  const [harvest, ...others] = logFormKinds
  const HarvestIcon = harvest.icon

  return (
    <div className="mx-auto max-w-xl px-4 py-5 lg:py-8">
      <Breadcrumbs items={[{ label: 'Log' }]} />
      <h1 className="text-2xl font-semibold tracking-tight">What are you logging?</h1>
      <p className="mt-1 text-ink-muted">Every site uses the same four forms, so the numbers can be compared.</p>

      <Link
        to={`/log/${harvest.slug}`}
        className="mt-5 flex items-center gap-4 rounded-card bg-brand-700 p-5 text-white shadow-card hover:bg-brand-800"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <HarvestIcon className="size-7" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xl font-semibold">Log a harvest</span>
          <span className="mt-0.5 block text-sm text-brand-100">{harvest.description}</span>
        </span>
        <ArrowRight className="size-6 shrink-0" aria-hidden />
      </Link>

      <h2 className="mt-6 mb-2 text-sm font-semibold text-ink-muted">Other forms</h2>
      <ul className="space-y-2">
        {others.map(({ slug, title, description, icon: Icon }) => (
          <li key={slug}>
            <Link
              to={`/log/${slug}`}
              className="flex min-h-12 items-center gap-3 rounded-card bg-surface p-4 shadow-card hover:bg-brand-50"
            >
              <Icon className="size-6 shrink-0 text-brand-700" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-ink-muted">{description}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-ink-subtle" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-ink-muted">
        {userLogCount === 0
          ? 'Nothing logged on this device yet. Logs are saved in this browser only.'
          : `${userLogCount} ${userLogCount === 1 ? 'log' : 'logs'} saved on this device. Logs are saved in this browser only.`}
      </p>
    </div>
  )
}
