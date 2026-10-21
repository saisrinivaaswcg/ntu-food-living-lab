import { Coins, Leaf, Printer, Scale, Users } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import { costAssumptions, CUP_SEMESTER, DEMO_DATA_NOTICE, PRICE_SURVEY_DATE, supermarketPrices } from '../../data'
import { useCommunity, useHandovers } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useWorkspaceSite } from '../../hooks/useWorkspaceSite'
import { formatShortDate } from '../../lib/dates'
import { formatSGD } from '../../lib/format'
import { anchorDate, impactReport, periodBetween, resolvePeriod, type Period } from '../../lib/metrics'
import NotFoundPage from '../NotFoundPage'

type TermKey = 'semester' | '3m' | 'all'
const TERMS: { key: TermKey; label: string }[] = [
  { key: 'semester', label: CUP_SEMESTER.label },
  { key: '3m', label: 'Last 3 months' },
  { key: 'all', label: 'Everything logged' },
]

/** Impact report per site and term: environment, economy and society, each with a trade-off. Printable. */
export default function ImpactPage() {
  const { site } = useWorkspaceSite()
  const { logs } = useLogs()
  const { joins, tasks, claims } = useCommunity()
  const handovers = useHandovers(site?.id ?? '')
  const [term, setTerm] = useState<TermKey>('semester')
  const period: Period = useMemo(
    () => (term === 'semester' ? periodBetween(CUP_SEMESTER.start, CUP_SEMESTER.end, anchorDate(logs)) : resolvePeriod(term, logs)),
    [term, logs],
  )
  const report = useMemo(
    () =>
      site
        ? impactReport(logs, site, period, supermarketPrices, costAssumptions, { joins, tasks, claims, handoverDates: handovers.map((h) => h.date) })
        : null,
    [logs, site, period, joins, tasks, claims, handovers],
  )
  usePageTitle(site ? `Impact report · ${site.shortName}` : 'Site not found')
  if (!site || !report) return <NotFoundPage title="Site not found" message="There is no site with that name. Pick one from the site switcher." />

  const { environment: env, economy: eco, society: soc } = report
  const termLabel = TERMS.find((t) => t.key === term)?.label
  const range = `${period.start ? formatShortDate(period.start) : 'start'} to ${formatShortDate(period.end)}`

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-8 print:max-w-none print:p-0">
      <div className="print:hidden">
        <WorkspaceHeader
          crumbs={[{ label: site.shortName }, { label: 'Impact report' }]}
          title="Impact report"
          lead="What the garden did for the environment, the economy and people, with the trade-off in each."
          actions={
            <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-brand-700 px-4 font-semibold text-white hover:bg-brand-800">
              <Printer className="size-4" aria-hidden />
              Print report
            </button>
          }
        />
        <div role="group" aria-label="Period" className="mb-6 flex flex-wrap gap-1.5">
          {TERMS.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={term === t.key}
              onClick={() => setTerm(t.key)}
              className="inline-flex min-h-12 items-center rounded-sm border border-line-strong px-3 text-sm font-semibold aria-pressed:border-brand-700 aria-pressed:bg-brand-700 aria-pressed:text-white"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <article className="space-y-5">
        <header className="border-b border-ink pb-3">
          <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">Impact report · {termLabel}</p>
          <h2 className="font-display text-3xl font-medium">{site.name}</h2>
          <p className="text-ink-muted">{range}</p>
          <p className="mt-1 text-xs text-demo">{DEMO_DATA_NOTICE}</p>
        </header>

        <Pillar
          icon={<Leaf className="size-6" aria-hidden />}
          title="Environment"
          stats={[
            { k: 'Grown', v: `${env.kg.toFixed(1)} kg` },
            { k: 'Water per kg', v: env.waterPerKg !== null ? `${Math.round(env.waterPerKg)} L` : '—' },
            { k: 'Compost added', v: `${env.compostKg.toFixed(0)} kg` },
            { k: 'Canteen food waste composted', v: `${env.canteenWasteKg.toFixed(0)} kg` },
          ]}
          note={env.note}
        />
        <Pillar
          icon={<Coins className="size-6" aria-hidden />}
          title="Economy"
          stats={[
            { k: 'Produce value at supermarket prices', v: formatSGD(eco.value) },
            { k: 'Input costs', v: formatSGD(eco.inputCost), d: `water ${formatSGD(eco.costs.water)} · compost ${formatSGD(eco.costs.compost)} · plants ${formatSGD(eco.costs.propagation)}` },
            { k: 'Value minus inputs', v: formatSGD(eco.net) },
            { k: 'Volunteer hours (not costed)', v: `${Math.round(eco.labourHours)} h` },
          ]}
          note={eco.note}
          foot={`Prices: ${PRICE_SURVEY_DATE}, local price where sold, else imported. Composted harvests are left out of the value.`}
        />
        <Pillar
          icon={<Users className="size-6" aria-hidden />}
          title="Society"
          stats={[
            { k: 'People who joined', v: String(soc.joined) },
            { k: 'Task slots filled', v: `${soc.slotsFilled} of ${soc.slotsOffered}` },
            { k: 'Committee handover', v: soc.handoverDone ? 'Done' : 'Not yet' },
          ]}
          note={soc.note}
        />
      </article>
    </div>
  )
}

function Pillar({ icon, title, stats, note, foot }: { icon: ReactNode; title: string; stats: { k: string; v: string; d?: string }[]; note: string; foot?: string }) {
  return (
    <section className="break-inside-avoid rounded-card bg-surface p-5 shadow-card print:shadow-none print:ring-1 print:ring-line lg:p-6">
      <h3 className="flex items-center gap-2 font-display text-2xl font-medium text-brand-800">
        {icon}
        {title}
      </h3>
      <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.k}>
            <dt className="text-sm text-ink-muted">{s.k}</dt>
            <dd className="font-display text-2xl font-medium tabular-nums">{s.v}</dd>
            {s.d && <dd className="text-xs text-ink-muted">{s.d}</dd>}
          </div>
        ))}
      </dl>
      <p className="mt-4 flex items-start gap-2 rounded-sm bg-sunken px-3 py-2.5 text-sm">
        <Scale className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden />
        <span>
          <strong className="font-semibold">Trade-off: </strong>
          {note}
        </span>
      </p>
      {foot && <p className="mt-2 text-xs text-ink-muted">{foot}</p>}
    </section>
  )
}
