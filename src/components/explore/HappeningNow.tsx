import { useMemo, type ReactNode } from 'react'
import { CUP_SEMESTER, DEMO_DATA_SHORT_NOTICE } from '../../data'
import { useCommunity } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { addDays, parseISODate, todayISO } from '../../lib/dates'
import { formatNumber } from '../../lib/format'
import { siteName } from '../../lib/lookups'
import { happeningNow } from '../../lib/metrics'
import CountUp from '../ui/CountUp'

const whole = (n: number) => formatNumber(Math.round(n))

/** "Today", "Tomorrow", else e.g. "Sat, 24 Oct". */
function dayLabel(date: string): string {
  const today = todayISO()
  if (date === today) return 'Today'
  if (date === addDays(today, 1)) return 'Tomorrow'
  return parseISODate(date).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })
}

/**
 * "Happening now" under the hero's buttons: real figures from the logs and the community store. Any
 * figure that would be zero or empty is left out, and the row disappears when all of them are.
 */
export default function HappeningNow() {
  const { logs } = useLogs()
  const { tasks, claims, joins } = useCommunity()
  const now = useMemo(() => happeningNow(logs, tasks, claims, joins, CUP_SEMESTER), [logs, tasks, claims, joins])
  const next = now.nextBeginnerTask

  const items: { key: string; value: ReactNode; label: string }[] = []
  if (now.termKg >= 1) items.push({ key: 'kg', value: <CountUp value={now.termKg} format={(n) => `${whole(n)} kg`} />, label: 'harvested this term' })
  if (now.beginnerSlotsThisWeek > 0)
    items.push({ key: 'slots', value: <CountUp value={now.beginnerSlotsThisWeek} format={whole} />, label: 'beginner slots open this week' })
  if (next)
    items.push({
      key: 'next',
      value: dayLabel(next.date),
      label: `next beginner session, ${next.start} at ${siteName(next.siteId, true)}`,
    })
  if (now.studentsInCommunities > 0)
    items.push({ key: 'people', value: <CountUp value={now.studentsInCommunities} format={whole} />, label: 'students in garden communities' })

  if (items.length === 0) return null
  return (
    <section aria-labelledby="happening-heading" className="mt-6 border-t border-white/30 pt-4 sm:mt-10 lg:mt-14">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 id="happening-heading" className="text-sm font-semibold tracking-wide uppercase">
          Happening now
        </h2>
        <p className="rounded-sm bg-demo-bg px-1.5 py-0.5 text-xs text-demo">{DEMO_DATA_SHORT_NOTICE}</p>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.key} className="flex flex-col-reverse justify-end">
            <dt className="text-sm leading-snug text-white/85">{item.label}</dt>
            <dd className="font-display text-[1.75rem] leading-tight font-medium tabular-nums sm:text-4xl lg:text-5xl">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
