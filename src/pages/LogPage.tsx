import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { logFormKinds } from '../components/log/logFormKinds'
import SlotImage from '../components/ui/SlotImage'
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
        className="group relative mt-8 flex items-end gap-5 overflow-hidden rounded-2xl bg-brand-900 p-6 text-white shadow-float transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 lg:min-h-64 lg:p-8"
      >
        <SlotImage slot={harvest.image} zoomOnHover caption="top" sizes="(min-width: 672px) 42rem, 100vw" />
        {/* Scrim keeps the white text readable over the photo. */}
        <span className="absolute inset-0 bg-linear-to-t from-brand-900/95 via-brand-900/70 to-brand-900/10" aria-hidden />
        <HarvestIcon className="relative size-9 shrink-0 self-center text-brand-200" strokeWidth={1.5} aria-hidden />
        <span className="relative min-w-0 flex-1 pt-16 lg:pt-20">
          <span className="block font-display text-3xl font-medium lg:text-4xl">Log a harvest</span>
          <span className="mt-1 block text-white/85">{harvest.description}</span>
        </span>
        <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-accent transition-transform duration-200 group-hover:translate-x-1">
          <ArrowRight className="size-5" aria-hidden />
        </span>
      </Link>

      <h2 className="mt-10 mb-1 text-sm font-semibold text-ink-muted">Other forms</h2>
      <ul className="border-t border-ink">
        {others.map(({ slug, title, description, icon: Icon, image }) => (
          <li key={slug} className="border-b border-line">
            <Link to={`/log/${slug}`} className="group flex min-h-12 items-center gap-4 py-4">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">
                <SlotImage slot={image} zoomOnHover caption="none" sizes="5rem" />
              </span>
              <Icon className="hidden size-6 shrink-0 text-brand-700 sm:block" strokeWidth={1.75} aria-hidden />
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
