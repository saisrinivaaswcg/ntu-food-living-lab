import { Leaf } from 'lucide-react'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useRole } from '../../hooks/useCommunity'
import { paths } from '../../lib/paths'
import { usesWorkspace } from '../../lib/roles'
import RolePill from '../access/RolePill'
import { navItems } from './navItems'

/**
 * Sticky header. Once the page scrolls it tightens: the subtitle fades, the logo mark scales down and a
 * shadow fades in. Only opacity and transform change, so scrolling never triggers layout.
 */
export default function TopNav() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const role = useRole()
  const loggers = usesWorkspace(role)
  // The workspace gets a button of its own on the right.
  const items = navItems.filter((item) => !item.workspace)
  // Motion value, not a scroll listener: React state changes only when the threshold is crossed.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > 24
    if (next !== scrolled) setScrolled(next)
  })

  return (
    <header className="sticky top-0 z-[1000] border-b border-line bg-surface">
      <span
        className={`pointer-events-none absolute inset-0 shadow-float transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden
      />
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 lg:h-16 lg:px-8">
        <Link to="/" className="group flex min-h-12 min-w-0 items-center gap-2 text-ink min-[400px]:gap-2.5">
          <span
            className={`flex size-9 items-center justify-center rounded-sm bg-brand-700 text-white transition-transform duration-300 group-hover:-rotate-6 ${
              scrolled ? 'scale-90' : 'scale-100'
            }`}
          >
            <Leaf className="size-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="font-display text-[15px] font-medium whitespace-nowrap min-[400px]:text-lg">NTU Omniplant</span>
            <span
              className={`hidden text-xs text-ink-muted transition-opacity duration-300 sm:block ${scrolled ? 'opacity-0' : 'opacity-100'}`}
            >
              Campus food gardens, one shared record
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {items.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `group relative flex min-h-12 items-center px-2.5 font-medium whitespace-nowrap ${
                        isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {label}
                        {/* Underline slides in from the left on hover; stays put for the current page. */}
                        <span
                          className={`absolute inset-x-2.5 bottom-2 h-0.5 origin-left bg-brand-700 transition-transform duration-300 ${
                            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                          }`}
                          aria-hidden
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
              {loggers && (
                <li className="ml-2">
                  <Link
                    to={paths.workspace}
                    className="inline-flex min-h-12 items-center rounded-sm bg-accent px-4 font-semibold whitespace-nowrap text-white transition-transform hover:-translate-y-0.5 hover:bg-accent-strong active:translate-y-0"
                  >
                    Open workspace
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <RolePill />
        </div>
      </div>
    </header>
  )
}
