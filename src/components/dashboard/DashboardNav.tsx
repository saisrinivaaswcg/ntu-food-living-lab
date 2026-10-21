import { NavLink, useLocation } from 'react-router-dom'
import { paths } from '../../lib/paths'

const TABS = [
  { to: paths.dashboard(), label: 'Overview', end: true },
  { to: paths.dashboard('harvest'), label: 'Harvest', end: false },
  { to: paths.dashboard('planting'), label: 'Planting', end: false },
]

/** Links between the three dashboards. The query string (period, site) travels with them. */
export default function DashboardNav() {
  const { search } = useLocation()
  return (
    <nav aria-label="Dashboards" className="border-b border-line">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={{ pathname: tab.to, search }}
              end={tab.end}
              className={({ isActive }) =>
                `group relative flex min-h-12 items-center px-4 font-semibold whitespace-nowrap transition-colors ${
                  isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {tab.label}
                  <span
                    className={`absolute inset-x-4 bottom-0 h-0.5 origin-left bg-brand-700 transition-transform duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                    aria-hidden
                  />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
