import { ArrowRight, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { paths } from '../../lib/paths'

/**
 * The public side's two doors, in the hero and again at the end of the home story: beginner help
 * (Get involved, filtered to beginner-friendly tasks) and joining a garden community. Full width on
 * phones so both sit in thumb reach; side by side from 640px.
 */
export default function PrimaryActions({ tone, className = '' }: { tone: 'photo' | 'paper'; className?: string }) {
  const second =
    tone === 'photo'
      ? 'bg-surface text-ink hover:bg-white'
      : 'border border-brand-700 bg-brand-700 text-white hover:bg-brand-800'
  return (
    <div className={`grid gap-3 sm:flex sm:flex-wrap ${className}`}>
      <Link
        to={paths.getInvolvedBeginners}
        className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-accent px-5 font-semibold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-accent-strong active:translate-y-0 sm:justify-start"
      >
        New here? Help out
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
      <Link
        to={paths.join}
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-5 font-semibold transition-[background-color,transform] hover:-translate-y-0.5 active:translate-y-0 sm:justify-start ${second}`}
      >
        <Users className="size-4" aria-hidden />
        Join a community
      </Link>
    </div>
  )
}
