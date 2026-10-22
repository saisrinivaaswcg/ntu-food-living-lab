import type { FocusEventHandler, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DEMO_COMMITTEE_SITE } from '../../data'
import { useRole } from '../../hooks/useCommunity'
import { setRole } from '../../lib/communityStore'
import { siteName } from '../../lib/lookups'
import { notifyError } from '../../lib/notify'
import { committeeViewRole } from '../../lib/roles'
import type { SiteId } from '../../types'

interface Props {
  to: string
  /** 'site': a page for one site (Handover); 'workspace': any committee can open it (Dashboards). */
  scope: 'site' | 'workspace'
  siteId?: SiteId
  className?: string
  onFocus?: FocusEventHandler<HTMLAnchorElement>
  children: ReactNode
}

/**
 * A link into the committee workspace from the public side. If the current role can't open the page,
 * clicking switches to the demo committee role for the site first (demo login: anyone can switch).
 * Callers show a visible "Demo role" label beside it.
 */
export default function CommitteeViewLink({ to, scope, siteId = DEMO_COMMITTEE_SITE, className, onFocus, children }: Props) {
  const role = useRole()
  const next = committeeViewRole(role, siteId, scope)
  return (
    <Link
      to={to}
      className={className}
      onFocus={onFocus}
      onClick={() => {
        if (!next) return
        const result = setRole(next)
        if (!result.ok) notifyError(`${result.error} You can still look around as this role until you close the tab.`)
      }}
    >
      {children}
      {next && <span className="sr-only"> (switches to the demo {siteName(siteId, true)} committee role)</span>}
    </Link>
  )
}
