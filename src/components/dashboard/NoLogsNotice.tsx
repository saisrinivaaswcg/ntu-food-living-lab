import { ClipboardPen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { paths } from '../../lib/paths'
import EmptyState from '../ui/EmptyState'

/** Shown on every dashboard when there are no logs at all (demo data off, nothing logged here). */
export default function NoLogsNotice() {
  return (
    <div className="mt-8 max-w-2xl">
      <EmptyState
        title="No logs to show"
        detail="Demo data is switched off and nothing has been logged on this device yet. Turn on demo data above, or log a harvest."
      />
      <Link
        to={paths.log()}
        className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-sm bg-accent px-5 font-semibold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-accent-strong active:translate-y-0"
      >
        <ClipboardPen className="size-4" aria-hidden />
        Go to Log
      </Link>
    </div>
  )
}
