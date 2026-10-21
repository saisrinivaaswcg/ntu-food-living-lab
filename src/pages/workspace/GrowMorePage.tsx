import { ArrowRight, CalendarRange, Sprout } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import ReadOnlyNotice from '../../components/workspace/ReadOnlyNotice'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import { costAssumptions, DEMO_DATA_SHORT_NOTICE, GROW_ASSUMPTIONS, plantingWindows, PRICE_SURVEY_DATE, supermarketPrices } from '../../data'
import { useCrops } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useWorkspaceSite } from '../../hooks/useWorkspaceSite'
import { addDays, formatShortDate, parseISODate } from '../../lib/dates'
import { formatSGD } from '../../lib/format'
import { inputClass } from '../../lib/forms'
import { cropName } from '../../lib/lookups'
import { expansionEstimate, growthAsOf, plantNext, spareSpace } from '../../lib/metrics'
import { plantingFormFor } from '../../lib/paths'
import NotFoundPage from '../NotFoundPage'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Grow more: spare space, what to plant next, a planting calendar and an expansion planner. */
export default function GrowMorePage() {
  const { site, canEdit } = useWorkspaceSite()
  const { logs, sites } = useLogs()
  const crops = useCrops()
  const asOf = growthAsOf(logs)
  usePageTitle(site ? `Grow more · ${site.shortName}` : 'Site not found')

  const space = useMemo(() => (site ? spareSpace(logs, site, asOf) : null), [logs, site, asOf])
  const allSpace = useMemo(() => sites.map((s) => ({ site: s, ...spareSpace(logs, s, asOf) })), [logs, sites, asOf])
  const ranking = useMemo(() => (site ? plantNext(logs, site, supermarketPrices) : []), [logs, site])
  const [cropId, setCropId] = useState('')
  const [plants, setPlants] = useState('20')
  const chosenCrop = cropId || ranking[0]?.cropId || ''
  const count = Math.max(0, Math.min(2000, Math.round(Number(plants) || 0)))

  if (!site || !space) return <NotFoundPage title="Site not found" message="There is no site with that name. Pick one from the site switcher." />

  const estimate = chosenCrop && count > 0 ? expansionEstimate(logs, site, chosenCrop, count, supermarketPrices, costAssumptions, GROW_ASSUMPTIONS, asOf) : null
  // The planting goes in the bed with the most spare room.
  const targetBed = [...space.beds].sort((a, b) => b.spareSqm - a.spareSqm)[0]?.bed
  const startMonth = parseISODate(asOf).getMonth()
  const calendarMonths = Array.from({ length: 12 }, (_, i) => (startMonth + i) % 12)

  function plan(id: string) {
    setCropId(id)
    document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 lg:px-8 lg:py-8">
      <WorkspaceHeader
        crumbs={[{ label: site.shortName }, { label: 'Grow more' }]}
        title="Grow more"
        lead={
          <>
            Where there’s room, what to plant and what it would be worth. <span className="text-demo">{DEMO_DATA_SHORT_NOTICE}</span>
          </>
        }
      />
      {!canEdit && <ReadOnlyNotice site={site} tool="grow" />}

      <section aria-labelledby="space-heading" className="rounded-card bg-surface p-5 shadow-card lg:p-6">
        <h2 id="space-heading" className="font-display text-2xl font-medium">
          Spare space
        </h2>
        <p className="mt-1 text-sm text-ink-muted">Empty beds, plus room left in beds with fewer live plants than their spacing allows.</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="font-semibold">{site.shortName}: {space.spareSqm.toFixed(1)} of {space.areaSqm} m² free</h3>
            <ul className="mt-2 divide-y divide-line">
              {space.beds.map((b) => (
                <li key={b.bed.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2 text-sm">
                  <span className="font-semibold">{b.bed.label}</span>
                  <span className="text-ink-muted">
                    {b.cropId ? `${cropName(b.cropId)}: ${b.plantsAlive} of ~${b.capacity} plants` : 'Empty'} ·{' '}
                    <span className={b.spareSqm > 0.05 ? 'font-semibold text-brand-700' : ''}>{b.spareSqm.toFixed(1)} m² free</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Every site</h3>
            <ul className="mt-2 space-y-2">
              {allSpace.map((s) => (
                <li key={s.site.id} className="text-sm">
                  <div className="flex justify-between gap-2">
                    <span className={s.site.id === site.id ? 'font-semibold' : ''}>{s.site.shortName}</span>
                    <span className="tabular-nums text-ink-muted">
                      {s.spareSqm.toFixed(1)} / {s.areaSqm} m²
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-sunken" aria-hidden>
                    <div className="h-full origin-left rounded-full bg-brand-500" style={{ transform: `scaleX(${s.areaSqm > 0 ? Math.min(1, s.spareSqm / s.areaSqm) : 0})` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="next-heading" className="mt-6 rounded-card bg-surface p-5 shadow-card lg:p-6">
        <h2 id="next-heading" className="font-display text-2xl font-medium">
          What to plant next
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Ranked by our own logs: survival (45%), supermarket value per m² (35%) and speed to first harvest (20%). Prices: {PRICE_SURVEY_DATE}.
        </p>
        {ranking.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No crops to rank" detail="Add crops in Manage site." />
          </div>
        ) : (
          <ol className="mt-4 divide-y divide-line">
            {ranking.slice(0, 6).map((r, i) => (
              <li key={r.cropId} className="grid gap-2 py-3 sm:grid-cols-[2rem_1fr_auto] sm:items-center">
                <span className="font-display text-xl text-ink-subtle tabular-nums">{i + 1}</span>
                <div>
                  <p className="font-semibold">{cropName(r.cropId)}</p>
                  <p className="text-sm text-ink-muted">{r.reason}</p>
                </div>
                <button type="button" onClick={() => plan(r.cropId)} className="inline-flex min-h-12 items-center gap-1 justify-self-start rounded-sm border border-line-strong px-3 font-semibold hover:bg-sunken">
                  Estimate it
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="calendar-heading" className="mt-6 rounded-card bg-surface p-5 shadow-card lg:p-6">
        <h2 id="calendar-heading" className="flex items-center gap-2 font-display text-2xl font-medium">
          <CalendarRange className="size-6 text-brand-700" aria-hidden />
          Planting calendar
        </h2>
        <p className="mt-1 text-sm text-ink-muted">The next twelve months in Singapore’s weather. Each cell’s label also gives the first-harvest date for a planting that month.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[42rem] text-sm">
            <caption className="sr-only">Planting calendar: good, caution or fine for each crop by month</caption>
            <thead>
              <tr>
                <th scope="col" className="py-2 pr-3 text-left font-semibold">Crop</th>
                {calendarMonths.map((m) => (
                  <th key={m} scope="col" className="px-0.5 py-2 text-center font-semibold text-ink-muted">
                    {MONTHS[m]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crops.map((c) => {
                const w = plantingWindows[c.id]
                return (
                  <tr key={c.id} className="border-t border-line">
                    <th scope="row" className="py-1.5 pr-3 text-left font-semibold whitespace-nowrap">
                      {c.name}
                    </th>
                    {calendarMonths.map((m, i) => {
                      const kind = w?.good.includes(m + 1) ? 'good' : w?.caution.includes(m + 1) ? 'caution' : 'fine'
                      const plantDate = addDays(asOf, Math.round(i * 30.4))
                      const harvest = formatShortDate(addDays(plantDate, c.daysToFirstHarvest))
                      const label = `${c.name}, ${MONTHS[m]}: ${kind === 'good' ? 'good time to plant' : kind === 'caution' ? `plant with care. ${w?.note ?? ''}` : 'fine'}. First harvest about ${harvest}.`
                      return (
                        <td key={m} className="px-0.5 py-1.5">
                          <span
                            title={label}
                            aria-label={label}
                            role="img"
                            className={`block h-7 rounded-sm ${kind === 'good' ? 'bg-brand-600' : kind === 'caution' ? 'bg-demo-bg ring-1 ring-demo/40 ring-inset' : 'bg-sunken'}`}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5"><span className="inline-block size-4 rounded-sm bg-brand-600" aria-hidden /> Good time to plant</span>
          <span className="flex items-center gap-1.5"><span className="inline-block size-4 rounded-sm bg-demo-bg ring-1 ring-demo/40 ring-inset" aria-hidden /> With care</span>
          <span className="flex items-center gap-1.5"><span className="inline-block size-4 rounded-sm bg-sunken" aria-hidden /> Fine</span>
        </p>
        <ul className="mt-3 space-y-1 text-sm text-ink-muted">
          {crops.filter((c) => plantingWindows[c.id]?.caution.length).map((c) => (
            <li key={c.id}>
              <strong className="font-semibold text-ink">{c.name}:</strong> {plantingWindows[c.id]?.note}
            </li>
          ))}
        </ul>
      </section>

      <section id="planner" aria-labelledby="planner-heading" className="mt-6 scroll-mt-24 rounded-card bg-surface p-5 shadow-card lg:p-6">
        <h2 id="planner-heading" className="flex items-center gap-2 font-display text-2xl font-medium">
          <Sprout className="size-6 text-brand-700" aria-hidden />
          Expansion planner
        </h2>
        <p className="mt-1 text-sm text-ink-muted">Pick a crop and a plant count for {site.shortName}. Figures use NTU’s kg per plant over a season ({GROW_ASSUMPTIONS.seasonWeeks} weeks).</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="plan-crop" className="mb-1 block text-sm font-semibold">
              Crop
            </label>
            <select id="plan-crop" value={chosenCrop} onChange={(e) => setCropId(e.target.value)} className={inputClass}>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="plan-plants" className="mb-1 block text-sm font-semibold">
              Plants
            </label>
            <input id="plan-plants" inputMode="numeric" value={plants} onChange={(e) => setPlants(e.target.value.replace(/\D/g, ''))} className={inputClass} />
          </div>
        </div>

        {!estimate ? (
          <div className="mt-4">
            <EmptyState title="Enter a plant count" detail="Between 1 and 2,000 plants." />
          </div>
        ) : (
          <>
            <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { k: 'Estimated harvest', v: estimate.kg !== null ? `${estimate.kg.toFixed(1)} kg` : 'No NTU data yet', d: estimate.kgPerPlant !== null ? `${(estimate.kgPerPlant * 1000).toFixed(0)} g per plant` : 'Log a few harvests first' },
                { k: 'Supermarket value', v: estimate.value !== null ? formatSGD(estimate.value) : '—', d: estimate.pricePerKg !== null ? `at ${formatSGD(estimate.pricePerKg)}/kg` : 'No price data' },
                { k: 'Set-up cost', v: formatSGD(estimate.setupCost), d: `${estimate.areaSqm.toFixed(1)} m²: ${estimate.fromSpareSqm.toFixed(1)} spare, ${estimate.newBedSqm.toFixed(1)} new` },
                {
                  k: 'Payback',
                  v: estimate.paybackMonths !== null ? (estimate.paybackMonths < 1 ? 'Under a month' : `${estimate.paybackMonths.toFixed(1)} months`) : 'Doesn’t pay back',
                  d: `Running cost ${formatSGD(estimate.runningCost)} a season`,
                },
              ].map((x) => (
                <div key={x.k} className="rounded-sm bg-sunken p-3">
                  <dt className="text-sm text-ink-muted">{x.k}</dt>
                  <dd className="font-display text-2xl font-medium">{x.v}</dd>
                  <dd className="text-xs text-ink-muted">{x.d}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-ink-muted">
              Set-up: {crops.find((c) => c.id === chosenCrop)?.careGuide.startFrom} costs, {GROW_ASSUMPTIONS.compostKgPerSqm} kg compost per m², and S${GROW_ASSUMPTIONS.newBedPerSqm}
              /m² of new planter beyond spare space. Running cost: this site’s logged water per m². Volunteer time not counted.
            </p>
            {canEdit && targetBed && (
              <Link
                to={plantingFormFor(site.id, targetBed.id, chosenCrop, count)}
                className="group mt-4 inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-accent px-5 font-semibold text-white hover:bg-accent-strong"
              >
                Plan this planting in {targetBed.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            )}
          </>
        )}
      </section>
    </div>
  )
}
