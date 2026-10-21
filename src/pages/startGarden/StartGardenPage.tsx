import { ArrowRight, Sprout } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import EmptyState from '../../components/ui/EmptyState'
import PageHero from '../../components/ui/PageHero'
import Reveal from '../../components/ui/Reveal'
import { bedSizes, DEMO_DATA_SHORT_NOTICE, problemLog, starterItems, startSteps, illustrations } from '../../data'
import { useCrops } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { usePageTitle } from '../../hooks/usePageTitle'
import { formatSGD } from '../../lib/format'
import { BEGINNER_RATING_LABELS, cropAtNtu } from '../../lib/metrics'
import { paths } from '../../lib/paths'

/** Public guide: beginner crops ranked by NTU survival, bed sizes, starter cost and the steps to a hall garden. */
export default function StartGardenPage() {
  const crops = useCrops()
  usePageTitle('Start a garden at your hall')
  const { logs } = useLogs()
  const [sizeId, setSizeId] = useState(bedSizes[1]?.id ?? '')
  const size = bedSizes.find((b) => b.id === sizeId) ?? bedSizes[0]

  const ranked = useMemo(
    () =>
      crops
        .map((crop) => ({ crop, at: cropAtNtu(logs, crop.id, problemLog.filter((p) => p.cropId === crop.id).length) }))
        .filter((r) => r.at.survival !== null)
        .sort((a, b) => (b.at.survival ?? 0) - (a.at.survival ?? 0) || a.crop.daysToFirstHarvest - b.crop.daysToFirstHarvest),
    [logs, crops],
  )
  const kit = size ? starterItems.filter((i) => size.kit[i.id] > 0).map((i) => ({ ...i, qty: size.kit[i.id], total: size.kit[i.id] * i.price })) : []
  const total = kit.reduce((n, i) => n + i.total, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Start a garden' }]} />
      <PageHero slot={illustrations.heroes.startGarden}>
        <Reveal className="max-w-3xl">
          <h1 className="font-display text-display font-medium">Start a garden at your hall.</h1>
          <p className="mt-4 text-lg text-ink-muted lg:text-xl">
            A trough on a ledge is enough to begin. Here is what grows best at NTU, what it costs and the six steps from
            an empty corner to the Hall Garden Cup.
          </p>
          <p className="mt-2 text-sm text-demo">{DEMO_DATA_SHORT_NOTICE} Prices are indicative.</p>
          <Link
            to={paths.startGardenRequest}
            className="group mt-6 inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-accent px-5 font-semibold text-white hover:bg-accent-strong"
          >
            Request a hall site
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </Reveal>
      </PageHero>

      <section aria-labelledby="crops-heading" className="mt-16">
        <h2 id="crops-heading" className="font-display text-section font-medium">
          Beginner crops, ranked by survival at NTU
        </h2>
        <p className="mt-1 max-w-2xl text-ink-muted">From every planting and plant loss logged across campus. Start at the top.</p>
        {ranked.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="No survival data yet" detail="Once gardens log plantings and losses, crops are ranked here." />
          </div>
        ) : (
          <ol className="mt-5 border-t border-ink">
            {ranked.map(({ crop, at }, i) => (
              <li key={crop.id} className="grid grid-cols-[2.5rem_1fr] gap-x-3 gap-y-1 border-b border-line py-4 sm:grid-cols-[2.5rem_1.4fr_1fr_1fr_1fr] sm:items-baseline">
                <span className="font-display text-2xl text-ink-subtle tabular-nums">{i + 1}</span>
                <div>
                  <Link to={paths.learnCrop(crop.id)} className="font-semibold underline-offset-4 hover:underline">
                    {crop.name}
                  </Link>
                  <p className="text-sm text-ink-muted">{BEGINNER_RATING_LABELS[at.rating]}</p>
                </div>
                <p className="col-start-2 text-sm sm:col-start-auto">
                  <span className="font-semibold tabular-nums">{Math.round((at.survival ?? 0) * 100)}%</span> survive
                </p>
                <p className="col-start-2 text-sm sm:col-start-auto">
                  First harvest ~<span className="tabular-nums">{at.medianDays ?? crop.daysToFirstHarvest}</span> days
                </p>
                <p className="col-start-2 text-sm text-ink-muted sm:col-start-auto">
                  {size ? `${Math.round(crop.careGuide.plantsPerSqm * size.areaSqm)} plants fill ${size.name.toLowerCase()}` : ''}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="size-heading" className="mt-16 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="size-heading" className="font-display text-section font-medium">
            Bed size and starter cost
          </h2>
          <fieldset className="mt-5">
            <legend className="sr-only">Bed size</legend>
            <div className="space-y-2">
              {bedSizes.map((b) => (
                <label key={b.id} className="block cursor-pointer">
                  <input type="radio" name="bed-size" className="peer sr-only" checked={sizeId === b.id} onChange={() => setSizeId(b.id)} />
                  <span className="flex min-h-12 items-baseline justify-between gap-3 rounded-sm border border-line-strong bg-surface px-4 py-3 peer-checked:border-brand-700 peer-checked:bg-brand-50 peer-focus-visible:outline-2 peer-focus-visible:outline-focus">
                    <span>
                      <span className="block font-semibold">{b.name}</span>
                      <span className="block text-sm text-ink-muted">{b.fits}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{b.areaSqm} m²</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="rounded-card bg-surface p-5 shadow-card lg:col-span-7 lg:p-6">
          <h3 className="font-display text-2xl font-medium">Starter kit: {size?.name.toLowerCase()}</h3>
          <table className="mt-4 w-full text-left">
            <caption className="sr-only">Starter kit items and indicative prices</caption>
            <thead className="text-sm text-ink-muted">
              <tr className="border-b border-line">
                <th scope="col" className="py-2 font-semibold">Item</th>
                <th scope="col" className="py-2 text-right font-semibold">Qty</th>
                <th scope="col" className="py-2 text-right font-semibold">Cost</th>
              </tr>
            </thead>
            <tbody>
              {kit.map((i) => (
                <tr key={i.id} className="border-b border-line">
                  <td className="py-2">
                    {i.name}
                    <span className="block text-xs text-ink-muted">
                      {formatSGD(i.price)} per {i.unit}
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums">{i.qty}</td>
                  <td className="py-2 text-right tabular-nums">{formatSGD(i.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" className="pt-3 font-semibold">
                  Starter cost
                </th>
                <td />
                <td className="pt-3 text-right font-display text-2xl font-medium tabular-nums">{formatSGD(total)}</td>
              </tr>
            </tfoot>
          </table>
          <p className="mt-3 text-sm text-ink-muted">
            Indicative 2026 retail prices for a first season; water and volunteer time not included. Many halls fund this
            from the JCRC welfare budget.
          </p>
        </div>
      </section>

      <section aria-labelledby="steps-heading" className="mt-16">
        <h2 id="steps-heading" className="font-display text-section font-medium">
          Six steps
        </h2>
        <ol className="mt-5 grid gap-px overflow-hidden rounded-card bg-line shadow-card sm:grid-cols-2 lg:grid-cols-3">
          {startSteps.map((s, i) => (
            <li key={s.title} className="bg-surface p-5">
              <span className="flex size-8 items-center justify-center rounded-full bg-brand-700 font-semibold text-white tabular-nums">{i + 1}</span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-ink-muted">{s.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 flex flex-col gap-4 border-t border-ink pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex max-w-xl items-start gap-2 font-display text-2xl font-medium lg:text-3xl">
          <Sprout className="mt-1 size-7 shrink-0 text-brand-700" aria-hidden />
          Ready? Put your hall on the map.
        </p>
        <Link to={paths.startGardenRequest} className="group inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-sm bg-accent px-5 font-semibold text-white hover:bg-accent-strong">
          Request a hall site
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </section>
    </div>
  )
}
