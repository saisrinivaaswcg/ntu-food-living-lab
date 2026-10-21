import { ArrowRight, CalendarX2 } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import FormIllustration from '../../components/illustrations/FormIllustration'
import { logFormKinds } from '../../components/log/logFormKinds'
import ReadySoonCard from '../../components/log/ReadySoonCard'
import StatusBadge from '../../components/ui/StatusBadge'
import ResetDemoCard from '../../components/workspace/ResetDemoCard'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import { DEMO_DATA_SHORT_NOTICE } from '../../data'
import { useRole } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { formatDate, formatShortDate } from '../../lib/dates'
import { formatNumber, formatPercent } from '../../lib/format'
import { siteName } from '../../lib/lookups'
import { anchorDate, growthAsOf, logOverview, readySoon, workspaceSummary } from '../../lib/metrics'
import { paths } from '../../lib/paths'
import { editableSites, isAdmin, roleName } from '../../lib/roles'

/** The workspace home: what to do today at your site (or every site, for Admin). */
export default function TodayPage() {
  usePageTitle('Workspace')
  const role = useRole()
  const { logs, sites } = useLogs()
  const scoped = editableSites(role, sites)
  const siteIds = useMemo(() => scoped.map((s) => s.id), [scoped])
  const anchor = anchorDate(logs)
  const asOf = growthAsOf(logs)
  const summary = useMemo(() => workspaceSummary(logs, siteIds, anchor), [logs, siteIds, anchor])
  const overview = useMemo(() => logOverview(logs, siteIds, asOf), [logs, siteIds, asOf])
  const soon = useMemo(() => readySoon(logs, siteIds, asOf, 6), [logs, siteIds, asOf])
  const admin = isAdmin(role)
  const single = scoped.length === 1 ? scoped[0] : null
  const [harvest, ...otherForms] = logFormKinds

  const last = overview.lastHarvestDaysAgo
  const stats = [
    {
      label: 'Weekly logs, last 4 weeks',
      value: `${summary.completeness.logged} of ${summary.completeness.expected}`,
      note: formatPercent(summary.completeness.score),
    },
    { label: 'Harvested in that time', value: `${formatNumber(summary.harvestKg, 1)} kg`, note: `${summary.harvests} harvests` },
    { label: 'Ready this week', value: String(overview.readyThisWeek), note: `${overview.growing} beds growing` },
    {
      label: 'Last harvest',
      value: last === null ? '—' : last === 0 ? 'Today' : `${last} d ago`,
      note: last === null ? 'none yet' : 'days since',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 lg:px-8 lg:py-8">
      <WorkspaceHeader
        title={single ? single.name : 'All sites'}
        lead={`${roleName(role, null)} · numbers up to ${formatDate(anchor)}.`}
      />

      <section aria-labelledby="quick-heading">
        <h2 id="quick-heading" className="sr-only">
          Log something
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <Link
            to={paths.log(harvest.slug)}
            className="group col-span-3 flex min-h-20 items-center gap-4 rounded-card bg-accent p-4 font-semibold text-white transition-colors hover:bg-accent-strong lg:col-span-1 lg:min-h-24"
          >
            <FormIllustration kind="harvest" className="size-12 shrink-0 text-white" />
            <span className="text-xl">
              Log a harvest
              <ArrowRight className="ml-1 inline size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>
          {otherForms.map((f) => (
            <Link
              key={f.slug}
              to={paths.log(f.slug)}
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-card bg-surface p-3 text-center text-sm font-semibold shadow-card transition-colors hover:bg-sunken sm:flex-row sm:justify-start sm:gap-3 sm:p-4 sm:text-left sm:text-base"
            >
              <FormIllustration kind={f.slug} className="size-8 shrink-0 text-brand-700 sm:size-9" />
              {f.title}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="numbers-heading" className="mt-8">
        <h2 id="numbers-heading" className="font-semibold">
          Last four weeks{' '}
          <span className="font-normal text-ink-muted">
            ({formatShortDate(summary.weeks[0])} – {formatDate(anchor)})
          </span>
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-line shadow-card lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface p-4">
              <dt className="text-sm text-ink-muted">{s.label}</dt>
              <dd className="mt-1">
                <span className="block font-display text-3xl font-medium tabular-nums">{s.value}</span>
                <span className="text-sm text-ink-muted">{s.note}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-demo">{DEMO_DATA_SHORT_NOTICE}</p>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="soon-heading" className="min-w-0">
          <h2 id="soon-heading" className="font-semibold">
            Ready soon
          </h2>
          {soon.length === 0 ? (
            <p className="mt-3 bg-sunken p-4 text-ink-muted">Nothing is due for harvest in the next two weeks.</p>
          ) : (
            <ul className="-mx-4 mt-3 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
              {soon.map((t) => (
                <li key={t.status.bed.id} className="shrink-0 snap-start">
                  <ReadySoonCard timeline={t} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="missing-heading">
          <h2 id="missing-heading" className="font-semibold">
            Weekly logs missing
          </h2>
          {summary.missingWeeks.length === 0 ? (
            <p className="mt-3 bg-sunken p-4 text-ink-muted">Every week in the last four is logged. Well kept.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-card bg-surface shadow-card">
              {summary.missingWeeks.slice(0, 6).map((m) => (
                <li key={`${m.siteId}-${m.weekStart}`} className="flex items-center gap-3 px-4 py-3">
                  <CalendarX2 className="size-5 shrink-0 text-attention" aria-hidden />
                  <span className="min-w-0 flex-1 text-sm">
                    Week of {formatShortDate(m.weekStart)}
                    {!single && <span className="block text-ink-muted">{siteName(m.siteId, true)}</span>}
                  </span>
                </li>
              ))}
              <li className="px-4 py-2">
                <Link
                  to={paths.log('weekly')}
                  className="flex min-h-12 items-center gap-1 font-semibold text-brand-700 underline underline-offset-4"
                >
                  Log weekly inputs
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </li>
            </ul>
          )}
        </section>
      </div>

      {admin && (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
          <section aria-labelledby="sites-heading" className="min-w-0">
            <h2 id="sites-heading" className="font-semibold">
              Every site
            </h2>
            <div className="mt-3 overflow-x-auto rounded-card bg-surface shadow-card">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="border-b border-line text-ink-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Site</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Weeks logged</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Last log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {summary.completeness.bySite.map((s) => {
                    const site = scoped.find((x) => x.id === s.siteId)
                    const lastLog = summary.lastLogBySite.get(s.siteId)
                    return (
                      <tr key={s.siteId}>
                        <th scope="row" className="px-4 py-2 font-semibold">
                          <Link
                            to={paths.siteTool(s.siteId, 'manage')}
                            className="inline-flex min-h-10 items-center underline-offset-4 hover:underline"
                          >
                            {siteName(s.siteId)}
                          </Link>
                        </th>
                        <td className="px-4 py-2">{site && <StatusBadge status={site.status} />}</td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {s.logged} of {s.expected}
                        </td>
                        <td className="px-4 py-2">{lastLog ? formatShortDate(lastLog) : 'Nothing yet'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
          <ResetDemoCard />
        </div>
      )}
    </div>
  )
}
