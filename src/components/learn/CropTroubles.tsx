import { useState } from 'react'
import { DEMO_DATA_SHORT_NOTICE, failureCauseOptions, problemCauseOptions } from '../../data'
import { formatDate } from '../../lib/dates'
import { siteName } from '../../lib/lookups'
import type { CropTrouble } from '../../lib/metrics'
import type { Crop } from '../../types'
import EmptyState from '../ui/EmptyState'
import Reveal from '../ui/Reveal'

const PAGE = 4
const causeLabel = (cause: string) =>
  [...problemCauseOptions, ...failureCauseOptions].find((c) => c.value === cause)?.label ?? cause

/** "What went wrong here": NTU's real problems and losses with this crop, and Singapore's climate notes. */
export default function CropTroubles({ crop, troubles }: { crop: Crop; troubles: CropTrouble[] }) {
  const [shown, setShown] = useState(PAGE)
  return (
    <section aria-labelledby="troubles-heading" className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h2 id="troubles-heading" className="font-display text-section font-medium">
            What went wrong here
          </h2>
          <p className="mt-2 max-w-xl text-ink-muted">
            Problems and plant losses NTU’s gardens logged with {crop.name}, and what fixed them.{' '}
            <span className="text-demo">{DEMO_DATA_SHORT_NOTICE}</span>
          </p>
          {troubles.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Nothing has gone wrong yet"
                detail={`No problems or losses have been logged for ${crop.name} at NTU. When they are, they show up here with what fixed them.`}
              />
            </div>
          ) : (
            <>
              <ol className="mt-8 border-t border-ink">
                {troubles.slice(0, shown).map((tr) => (
                  <Reveal as="li" key={tr.id} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                    <p className="text-sm text-ink-muted">
                      {formatDate(tr.date)}
                      <span className="block">{siteName(tr.siteId, true)}</span>
                    </p>
                    {tr.kind === 'problem' ? (
                      <div>
                        <h3 className="font-semibold">
                          {tr.title}{' '}
                          <span className="text-sm font-normal text-ink-muted">· {causeLabel(tr.cause)}</span>
                        </h3>
                        <p className="mt-1 text-ink-muted">{tr.what}</p>
                        <p className="mt-2">
                          <span className="font-semibold">What we did: </span>
                          {tr.fix}
                        </p>
                        <p className="mt-1 text-sm">
                          <span className={`font-semibold ${tr.resolved ? 'text-brand-700' : 'text-attention'}`}>
                            {tr.resolved ? 'Fixed. ' : 'Still open. '}
                          </span>
                          {tr.outcome}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold">
                          {tr.inBed ? `${tr.lost} of ${tr.inBed} plants lost` : `${tr.lost} plants lost`}{' '}
                          <span className="text-sm font-normal text-ink-muted">· {causeLabel(tr.cause)}</span>
                        </h3>
                        <p className="mt-1 text-ink-muted">{tr.what}</p>
                        {tr.recovered > 0 && (
                          <p className="mt-1 text-sm font-semibold text-brand-700">{tr.recovered} recovered afterwards.</p>
                        )}
                      </div>
                    )}
                  </Reveal>
                ))}
              </ol>
              {troubles.length > shown && (
                <button
                  type="button"
                  onClick={() => setShown((n) => n + PAGE)}
                  className="mt-4 inline-flex min-h-12 items-center rounded-sm border border-line-strong px-4 font-semibold hover:bg-sunken"
                >
                  Show more ({troubles.length - shown} left)
                </button>
              )}
            </>
          )}
        </div>

        <aside aria-labelledby="climate-heading" className="lg:pt-2">
          <h2 id="climate-heading" className="font-display text-2xl font-medium">
            In Singapore’s weather
          </h2>
          <ul className="mt-4 space-y-4">
            {crop.careGuide.climate.map((note) => (
              <Reveal as="li" key={note} className="border-l-2 border-brand-300 pl-4 text-ink">
                {note}
              </Reveal>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}
