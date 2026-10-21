import { ArrowRight, BookOpen, CalendarCheck, Handshake } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/dates'
import { formatWorkday } from '../../lib/community'
import { cropName } from '../../lib/lookups'
import type { CropId, HelpTask, ISODate, Workday } from '../../types'

interface Props {
  /** A crop to start with, if the site grows one */
  cropId?: CropId
  /** The soonest beginner task, if any */
  task?: HelpTask
  /** Link for step 2 (the task list) */
  tasksHref: string
  next: { workday: Workday; date: ISODate } | null
  meetingPoint?: string
  /** Link for step 3 (the join form or the site's join page) */
  meetHref: string
  siteLabel: string
}

/** The newcomer path in three steps: learn a crop → claim a beginner task → meet the committee. */
export default function NewcomerPath({ cropId, task, tasksHref, next, meetingPoint, meetHref, siteLabel }: Props) {
  const steps = [
    {
      icon: BookOpen,
      title: cropId ? `Learn ${cropName(cropId)}` : 'Learn a crop',
      detail: cropId
        ? `${siteLabel} grows it now. Ten minutes of scrolling covers sowing to harvest.`
        : 'Pick an easy crop and follow it from seed to harvest.',
      to: cropId ? `/learn/${cropId}` : '/learn',
      action: 'Open the guide',
    },
    {
      icon: CalendarCheck,
      title: 'Claim a beginner task',
      detail: task
        ? `Next: ${task.title}, ${formatDate(task.date)} at ${task.start}. Someone shows you how.`
        : 'Beginner sessions are posted most weeks; nothing needs experience.',
      to: tasksHref,
      action: task ? 'See beginner tasks' : 'See what’s posted',
    },
    {
      icon: Handshake,
      title: 'Meet the committee',
      detail: next
        ? `${formatWorkday(next.workday)}${meetingPoint ? ` at ${meetingPoint.charAt(0).toLowerCase()}${meetingPoint.slice(1)}` : ''}. Next one ${formatDate(next.date)}.`
        : 'Ask to join and the committee will message you with a time.',
      to: meetHref,
      action: 'Ask to join',
    },
  ]

  return (
    <ol className="grid gap-px overflow-hidden rounded-card bg-line shadow-card md:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.title} className="flex flex-col bg-surface p-5 lg:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand-700 text-white tabular-nums">{i + 1}</span>
            <s.icon className="size-5 text-brand-700" aria-hidden />
          </p>
          <h3 className="mt-3 font-display text-xl font-medium">{s.title}</h3>
          <p className="mt-1 flex-1 text-ink-muted">{s.detail}</p>
          {s.to.startsWith('#') ? (
            <a href={s.to} className="group mt-4 inline-flex min-h-12 items-center gap-1.5 font-semibold text-brand-700 underline-offset-4 hover:underline">
              {s.action}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </a>
          ) : (
            <Link to={s.to} className="group mt-4 inline-flex min-h-12 items-center gap-1.5 font-semibold text-brand-700 underline-offset-4 hover:underline">
              {s.action}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          )}
        </li>
      ))}
    </ol>
  )
}
