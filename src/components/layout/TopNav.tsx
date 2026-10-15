import { Leaf } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { navItems } from './navItems'

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 lg:h-16 lg:px-8">
        <Link to="/" className="flex min-h-12 items-center gap-2 rounded-lg font-semibold text-ink">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-700 text-white">
            <Leaf className="size-5" aria-hidden />
          </span>
          <span className="leading-tight">
            NTU Food Living Lab
            <span className="hidden text-xs font-normal text-ink-muted sm:block">Campus Food Systems</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-muted hover:bg-canvas hover:text-ink'
                    }`
                  }
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
