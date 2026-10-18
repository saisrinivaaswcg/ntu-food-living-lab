import { ArrowRight } from 'lucide-react'
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
    <div className="mx-auto max-w-2xl px-4 py-5 lg:py-10">
      <Breadcrumbs items={[{ label: 'Log' }]} />
      <h1 className="font-display text-display font-medium">What are you logging?</h1>
      <p className="mt-3 text-lg text-ink-muted">Every site uses the same four forms, so the numbers can be compared.</p>

      <Link
        to={`/log/${harvest.slug}`}
        className="group mt-8 flex items-center gap-5 rounded-2xl bg-brand-800 p-6 text-white shadow-float transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-brand-900 active:translate-y-0 lg:p-8"
      >
        <HarvestIcon className="size-9 shrink-0 text-brand-200" strokeWidth={1.5} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-3xl font-medium lg:text-4xl">Log a harvest</span>
          <span className="mt-1 block text-white/85">{harvest.description}</span>
        </span>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent transition-transform duration-200 group-hover:translate-x-1">
          <ArrowRight className="size-5" aria-hidden />
        </span>
      </Link>

      <h2 className="mt-10 mb-1 text-sm font-semibold text-ink-muted">Other forms</h2>
      <ul className="border-t border-ink">
        {others.map(({ slug, title, description, icon: Icon }) => (
          <li key={slug} className="border-b border-line">
            <Link to={`/log/${slug}`} className="group flex min-h-12 items-center gap-4 py-4">
              <Icon className="size-6 shrink-0 text-brand-700" strokeWidth={1.75} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-medium decoration-brand-700 decoration-2 underline-offset-4 group-hover:underline">
                  {title}
                </span>
                <span className="block text-ink-muted">{description}</span>
              </span>
              <ArrowRight
                className="size-5 shrink-0 text-ink-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-ink"
                aria-hidden
              />
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
