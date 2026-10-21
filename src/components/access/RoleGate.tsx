import { Info, LockOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { DEMO_LOGIN_NOTICE } from '../../data'
import { useRole } from '../../hooks/useCommunity'
import type { DemoRole, RoleKind } from '../../types'
import { jumpToTop } from '../../lib/smoothScroll'
import RoleChooser from './RoleChooser'

interface Props {
  /** Roles that can use what's inside. */
  allow: RoleKind[]
  /** Extra check, e.g. "this committee's own site". */
  when?: (role: DemoRole) => boolean
  /** What the page is, e.g. "The Log". */
  what: string
  why: string
  children: ReactNode
  /** Classes for the role-card block (e.g. page padding when the gate wraps a whole layout). */
  className?: string
}

/**
 * Shows its children to the roles that can use them. Everyone else gets the matching role cards, one click
 * away, and stays on the same page: never a bare "access denied".
 */
export default function RoleGate({ allow, when, what, why, children, className = 'mt-2' }: Props) {
  const role = useRole()
  if (allow.includes(role.kind) && (!when || when(role))) return <>{children}</>

  return (
    <section aria-labelledby="gate-heading" className={className}>
      <div className="max-w-3xl">
        <LockOpen className="size-8 text-brand-700" aria-hidden />
        <h1 id="gate-heading" className="mt-3 font-display text-section font-medium">
          {what} is for {allow.map((k) => GATE_NAMES[k]).join(' and ')}
        </h1>
        <p className="mt-3 text-lg text-ink-muted">{why} Switch role below to carry on; you'll stay on this page.</p>
        <p className="mt-4 flex items-start gap-2 rounded-sm bg-demo-bg px-4 py-3 text-sm text-demo">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          {DEMO_LOGIN_NOTICE}
        </p>
      </div>
      <div className="mt-8">
        <RoleChooser only={allow} onChosen={jumpToTop} />
      </div>
    </section>
  )
}

const GATE_NAMES: Record<RoleKind, string> = {
  visitor: 'visitors',
  student: 'students',
  committee: 'site committees',
  admin: 'the Sustainability Office',
}
