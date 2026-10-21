import { useId } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useRole } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { useWorkspaceSite } from '../../hooks/useWorkspaceSite'
import { inputClass } from '../../lib/forms'
import { paths, type SiteTool } from '../../lib/paths'
import { setWorkspaceSiteId } from '../../lib/preferences'
import { canEditSite } from '../../lib/roles'

/**
 * Which site the site tools look at. Admin can pick any site. A committee works on its own site and can
 * look at others read-only from a site tool page; elsewhere it just shows their site.
 */
export default function WorkspaceSiteSwitcher() {
  const id = useId()
  const role = useRole()
  const { sites } = useLogs()
  const { site, fromUrl } = useWorkspaceSite()
  // On /workspace/sites/:siteId/:tool, the tool to stay on when the site changes.
  const tool = useLocation().pathname.match(/^\/workspace\/sites\/[^/]+\/([^/]+)/)?.[1]
  const navigate = useNavigate()

  if (role.kind === 'committee' && !fromUrl) {
    return (
      <p className="px-3 text-sm">
        <span className="block text-xs font-semibold tracking-wide text-ink-muted uppercase">Your site</span>
        <span className="font-semibold">{site?.name}</span>
      </p>
    )
  }

  const change = (siteId: string) => {
    if (role.kind === 'admin') setWorkspaceSiteId(siteId)
    // On a site tool, stay on the same tool for the new site.
    if (fromUrl && tool) navigate(paths.siteTool(siteId, tool as SiteTool))
  }

  return (
    <div className="px-3">
      <label htmlFor={id} className="mb-1 block text-xs font-semibold tracking-wide text-ink-muted uppercase">
        Site
      </label>
      <select
        id={id}
        value={site?.id ?? ''}
        onChange={(e) => change(e.target.value)}
        className={`${inputClass} truncate pr-8`}
      >
        {sites.map((s) => (
          <option key={s.id} value={s.id}>
            {s.shortName}
            {role.kind === 'committee' ? (canEditSite(role, s.id) ? ' (your site)' : ' (view only)') : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
