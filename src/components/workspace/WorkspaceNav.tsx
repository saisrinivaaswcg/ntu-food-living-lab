import { NavLink } from 'react-router-dom'
import { useRole } from '../../hooks/useCommunity'
import { useWorkspaceSite } from '../../hooks/useWorkspaceSite'
import { NAV_GROUP_LABELS, workspaceNav, type WorkspaceNavItem } from './workspaceNavItems'

/** The workspace's page list, grouped. Used in the desktop sidebar and the phone menu. */
export default function WorkspaceNav({ onNavigate }: { onNavigate?: () => void }) {
  const role = useRole()
  const { site } = useWorkspaceSite()
  const items = workspaceNav.filter((item) => !item.roles || item.roles.includes(role.kind))
  const groups = (Object.keys(NAV_GROUP_LABELS) as WorkspaceNavItem['group'][])
    .map((group) => ({ group, items: items.filter((i) => i.group === group) }))
    .filter((g) => g.items.length > 0)

  return (
    <nav aria-label="Workspace">
      {groups.map(({ group, items: groupItems }) => (
        <div key={group} className="mb-5">
          <h2 className="mb-1 px-3 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            {group === 'site' && site ? `${NAV_GROUP_LABELS[group]} · ${site.shortName}` : NAV_GROUP_LABELS[group]}
          </h2>
          <ul>
            {groupItems.map((item) => {
              if (item.tool && !site) return null
              const Icon = item.icon
              return (
                <li key={item.label}>
                  <NavLink
                    to={item.to(site?.id ?? '')}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex min-h-12 items-center gap-3 rounded-sm px-3 font-medium transition-colors ${
                        isActive ? 'bg-brand-700 text-white' : 'text-ink hover:bg-sunken'
                      }`
                    }
                  >
                    <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
