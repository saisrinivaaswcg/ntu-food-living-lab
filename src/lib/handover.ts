/** Handover wizard helpers: lessons from the problem log and the auto-generated term summary. */
import type { CupSemester, HelpTask, JoinRequest, LogCollections, ProblemEntry, Site, TaskClaim } from '../types'
import { formatShortDate } from './dates'
import { cropName } from './lookups'
import { anchorDate, computeCompleteness, computeKpis, filterLogs, harvestByCrop, netLoss, periodBetween, survivalRate } from './metrics'

/** Lesson candidates: the site's resolved problems as "what happened → what worked", newest first. */
export function lessonCandidates(problems: ProblemEntry[], siteId: string): string[] {
  return problems
    .filter((p) => p.siteId === siteId && p.status === 'resolved')
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => `${p.title}: ${p.actionTaken.replace(/\.$/, '')}. ${p.outcome}`.trim())
}

/** Open problems at the site, offered as open issues for the next committee. */
export function openProblems(problems: ProblemEntry[], siteId: string): ProblemEntry[] {
  return problems.filter((p) => p.siteId === siteId && p.status === 'open')
}

/** A few plain sentences on how the term went, generated from the logs. */
export function termSummary(
  logs: LogCollections,
  site: Site,
  term: CupSemester,
  community: { joins: JoinRequest[]; tasks: HelpTask[]; claims: TaskClaim[] },
): string[] {
  const period = periodBetween(term.start, term.end, anchorDate(logs))
  const own = filterLogs(logs, period, site.id)
  const kpis = computeKpis(own)
  const byCrop = harvestByCrop(own)
  const completeness = computeCompleteness(own.weeklyInputs, [site.id], period.completeWeeks)
  const survival = survivalRate(site.id, logs.plantings, logs.failures, period)
  const lost = own.failures.reduce((n, f) => n + netLoss(f), 0)
  const planted = own.plantings.reduce((n, p) => n + p.quantity, 0)
  const joined = community.joins.filter((j) => j.siteId === site.id && j.createdAt.slice(0, 10) >= term.start).length
  const taskIds = new Set(community.tasks.filter((t) => t.siteId === site.id).map((t) => t.id))
  const slots = community.claims.filter((c) => taskIds.has(c.taskId)).length

  const out = [
    `${term.label}, ${formatShortDate(period.start ?? term.start)} to ${formatShortDate(period.end)}: ${kpis.totalKg.toFixed(1)} kg harvested in ${own.harvests.length} harvests${
      byCrop[0] ? `, most of it ${cropName(byCrop[0].cropId)} (${byCrop[0].kg.toFixed(1)} kg)` : ''
    }.`,
    planted > 0 ? `${planted} plants put in across ${own.plantings.length} plantings.` : 'No new plantings this term.',
    lost > 0
      ? `${lost} plants lost in ${own.failures.length} loss ${own.failures.length === 1 ? 'event' : 'events'}${survival !== null ? `; survival ${Math.round(survival * 100)}%` : ''}.`
      : `No plant losses logged${survival !== null ? `; survival ${Math.round(survival * 100)}%` : ''}.`,
    completeness.score !== null
      ? `Weekly inputs logged for ${completeness.logged} of ${completeness.expected} weeks (${Math.round(completeness.score * 100)}%), ${Math.round(kpis.waterLitres)} L of water in all.`
      : 'No complete weeks yet this term.',
    `${joined} ${joined === 1 ? 'person' : 'people'} asked to join; ${slots} help-wanted ${slots === 1 ? 'slot' : 'slots'} filled.`,
  ]
  return out
}
