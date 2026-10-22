import { ArrowRight, BookOpen, ChartNoAxesCombined, Handshake, type LucideIcon } from 'lucide-react'
import { motion, type MotionStyle } from 'motion/react'
import type { FocusEventHandler, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DEMO_COMMITTEE_SITE } from '../../data'
import { paths } from '../../lib/paths'
import CommitteeViewLink from '../access/CommitteeViewLink'

interface Props {
  /** Pinned story only: one motion style per outcome. */
  styles?: MotionStyle[]
  /** Pinned story only: keyboard focus on a link scrolls the story to where the outcomes show. */
  onLinkFocus?: FocusEventHandler<HTMLAnchorElement>
  /** Pinned story only: drop the descriptions on short phone screens so all three fit the stage. */
  tight?: boolean
  className?: string
}

const linkClass =
  'group inline-flex min-h-12 items-center gap-1.5 font-semibold text-brand-700 underline decoration-brand-700/40 underline-offset-4 hover:decoration-brand-700'

/** What the shared record gives back: three outcomes, each a door to the page that shows it. */
export default function StoryOutcomes({ styles, onLinkFocus, tight = false, className = '' }: Props) {
  const arrow = <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
  const demo = (
    <span className="rounded-sm bg-demo-bg px-1.5 py-0.5 text-xs font-semibold text-demo" aria-hidden>
      Demo role
    </span>
  )
  const outcomes: { key: string; icon: LucideIcon; title: string; text: string; link: ReactNode }[] = [
    {
      key: 'educational',
      icon: BookOpen,
      title: 'Educational',
      text: 'Learn to grow from what really happened in NTU’s beds: what survived, how long it took, what went wrong.',
      link: (
        <Link to={paths.learn} className={linkClass} onFocus={onLinkFocus}>
          Learn to grow from real NTU logs
          {arrow}
        </Link>
      ),
    },
    {
      key: 'research',
      icon: ChartNoAxesCombined,
      title: 'Research',
      text: 'Every garden logs the same fields, so sites can be compared side by side and the data exported.',
      link: (
        <>
          <CommitteeViewLink to={paths.dashboard()} scope="workspace" className={linkClass} onFocus={onLinkFocus}>
            Compare the gardens’ data
            {arrow}
          </CommitteeViewLink>
          {demo}
        </>
      ),
    },
    {
      key: 'lasting',
      icon: Handshake,
      title: 'Lasting',
      text: 'Handover packs keep what each committee learned, so the next one starts ahead.',
      link: (
        <>
          <CommitteeViewLink to={paths.siteTool(DEMO_COMMITTEE_SITE, 'handover')} scope="site" className={linkClass} onFocus={onLinkFocus}>
            Read a handover pack
            {arrow}
          </CommitteeViewLink>
          {demo}
        </>
      ),
    },
  ]

  return (
    <ul className={`grid gap-3 lg:gap-6 ${className}`}>
      {outcomes.map(({ key, icon: Icon, title, text, link }, i) => (
        <motion.li key={key} className="border-t border-ink pt-2 lg:grid lg:grid-cols-[11rem_1fr] lg:gap-x-6 lg:pt-4" style={styles?.[i]}>
          <h4 className="flex items-center gap-2 font-display text-xl font-medium lg:items-start lg:text-2xl">
            <Icon className="size-5 shrink-0 text-accent lg:mt-1.5" strokeWidth={1.75} aria-hidden />
            {title}
          </h4>
          <div>
            <p className={`mt-1 text-sm text-ink-muted lg:mt-0.5 lg:text-base ${tight ? '[@media(max-height:44rem)]:max-lg:hidden' : ''}`}>{text}</p>
            <div className="flex flex-wrap items-center gap-x-2">{link}</div>
          </div>
        </motion.li>
      ))}
    </ul>
  )
}
