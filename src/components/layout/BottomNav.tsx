import { NavLink } from 'react-router-dom'
import { useRole } from '../../hooks/useCommunity'
import { usesWorkspace } from '../../lib/roles'
import { navItems } from './navItems'

/** Mobile tab bar — within thumb reach. Hidden on large screens, where TopNav shows the links. */
export default function BottomNav() {
  const role = useRole()
  const items = navItems.filter((item) => !item.desktopOnly && (!item.workspace || usesWorkspace(role)))
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid h-16" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors active:bg-sunken ${
                  isActive ? 'text-ink' : 'text-ink-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute inset-x-5 top-0 h-0.5 bg-brand-700 transition-transform duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                    aria-hidden
                  />
                  <Icon className="size-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
