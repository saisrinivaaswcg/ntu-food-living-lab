import { Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRole } from '../../hooks/useCommunity'
import { siteName } from '../../lib/lookups'
import { paths, type SiteTool } from '../../lib/paths'
import type { Site } from '../../types'

/** Shown when a committee member looks at another site's tool: they can read, not change. */
export default function ReadOnlyNotice({ site, tool }: { site: Site; tool: SiteTool }) {
  const role = useRole()
  return (
    <p className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-sm bg-establishing-bg px-4 py-3 text-establishing">
      <Eye className="size-5 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">
        View only: {site.shortName} is run by its own committee.
        {role.kind === 'committee' && ` You can change ${siteName(role.siteId, true)}.`}
      </span>
      {role.kind === 'committee' && (
        <Link
          to={paths.siteTool(role.siteId, tool)}
          className="inline-flex min-h-12 items-center font-semibold underline underline-offset-4"
        >
          Go to {siteName(role.siteId, true)}
        </Link>
      )}
    </p>
  )
}
