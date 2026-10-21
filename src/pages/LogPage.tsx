import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import RoleGate from '../components/access/RoleGate'
import FormIllustration from '../components/illustrations/FormIllustration'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { logFormKinds } from '../components/log/logFormKinds'
import LogOverviewStrip from '../components/log/LogOverviewStrip'
import ReadySoonCard from '../components/log/ReadySoonCard'
import RecentEntries from '../components/log/RecentEntries'
import SlotImage from '../components/ui/SlotImage'
import { useLogs } from '../hooks/useLogs'
import { useRole } from '../hooks/useCommunity'
import { usePageTitle } from '../hooks/usePageTitle'
import { growthAsOf, logOverview, readySoon } from '../lib/metrics'
import { editableSites } from '../lib/roles'

export default function LogPage() {
  usePageTitle('Log')
  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Log' }]} />
      <RoleGate
        allow={['committee', 'admin']}
        what="The Log"
        why="Harvests, plantings, weekly inputs and plant losses are logged by each site's committee."
      >
        <LogHome />
      </RoleGate>
    </div>
  )
}

function LogHome() {
  const { logs, sites, userLogCount } = useLogs()
  const role = useRole()
  const [harvest, ...others] = logFormKinds
  // A committee sees its own site; Admin sees every site.
  const siteIds = useMemo(() => editableSites(role, sites).map((s) => s.id), [role, sites])
  const asOf = growthAsOf(logs)
  const overview = useMemo(() => logOverview(logs, siteIds, asOf), [logs, siteIds, asOf])
  const soon = useMemo(() => readySoon(logs, siteIds, asOf), [logs, siteIds, asOf])

  return (
    <>
      <h1 className="font-display text-display font-medium">What are you logging?</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-muted">
        Every site uses the same four forms, so the numbers can be compared.
      </p>

      <div className="mt-8">
        <LogOverviewStrip overview={overview} />
      </div>

      {soon.length > 0 && (
        <section aria-labelledby="ready-heading" className="mt-10">
          <h2 id="ready-heading" className="font-display text-2xl font-medium">
            Ready soon
          </h2>
          <p className="mt-1 text-ink-muted">Tap a bed to log its harvest with the site, bed and crop filled in.</p>
          <ul className="-mx-4 mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
            {soon.map((t) => (
              <li key={t.status.bed.id} className="shrink-0 snap-start">
                <ReadySoonCard timeline={t} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="forms-heading" className="mt-12">
        <h2 id="forms-heading" className="sr-only">
          Log forms
        </h2>
        <Link
          to={`/log/${harvest.slug}`}
          className="group relative grid overflow-hidden rounded-3xl bg-brand-900 text-white shadow-float transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:grid-cols-2"
        >
          <span className="relative block aspect-[16/9] sm:aspect-auto sm:min-h-72">
            <SlotImage slot={harvest.image} zoomOnHover caption="top" sizes="(min-width: 640px) 32rem, 100vw" />
          </span>
          <span className="flex flex-col justify-end gap-3 p-6 lg:p-8">
            <FormIllustration kind="harvest" className="size-14 text-brand-200" />
            <span className="block font-display text-4xl font-medium">Log a harvest</span>
            <span className="block text-white/85">{harvest.description}</span>
            <span className="mt-2 inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-accent px-5 font-semibold">
              Start
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
            </span>
          </span>
        </Link>

        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {others.map(({ slug, title, description, image }) => (
            <li key={slug}>
              <Link
                to={`/log/${slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-card transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="relative block aspect-[16/9]">
                  <SlotImage slot={image} zoomOnHover caption="top" sizes="(min-width: 640px) 20rem, 100vw" />
                </span>
                <span className="flex flex-1 flex-col gap-1 p-5">
                  <FormIllustration
                    kind={slug}
                    className="relative -mt-12 size-14 rounded-2xl bg-surface p-1.5 text-brand-700 shadow-card"
                  />
                  <span className="mt-2 font-display text-2xl font-medium decoration-brand-700 decoration-2 underline-offset-4 group-hover:underline">
                    {title}
                  </span>
                  <span className="text-ink-muted">{description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-heading" className="mt-14">
        <h2 id="recent-heading" className="font-display text-section font-medium">
          Recent entries
        </h2>
        <p className="mt-2 mb-5 text-ink-muted">
          Fix a typo or remove a duplicate. Changes show on every dashboard straight away.
        </p>
        <RecentEntries siteIds={siteIds} />
      </section>

      <p className="mt-6 text-sm text-ink-muted">
        {userLogCount === 0
          ? 'Nothing logged on this device yet. Logs are saved in this browser only.'
          : `${userLogCount} ${userLogCount === 1 ? 'log' : 'logs'} saved on this device. Logs are saved in this browser only.`}
      </p>
    </>
  )
}
