import type { ReactNode } from 'react'
import Breadcrumbs, { type Crumb } from '../layout/Breadcrumbs'

interface Props {
  /** Omit on the workspace home */
  crumbs?: Crumb[]
  title: string
  /** One line under the title */
  lead?: ReactNode
  /** Buttons on the right (wrap below on phones) */
  actions?: ReactNode
}

/** Compact page header for workspace pages: tool pages, not editorial ones. */
export default function WorkspaceHeader({ crumbs, title, lead, actions }: Props) {
  return (
    <header className="mb-6">
      {crumbs && <Breadcrumbs items={crumbs} className="mb-1" />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-medium lg:text-4xl">{title}</h1>
          {lead && <p className="mt-1 max-w-3xl text-ink-muted">{lead}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  )
}
