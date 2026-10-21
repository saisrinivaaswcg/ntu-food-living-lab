import { ArrowUpRight, BarChart3, ClipboardPen, LayoutDashboard, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useRole } from '../../hooks/useCommunity'
import { paths } from '../../lib/paths'
import { usesWorkspace } from '../../lib/roles'
import WorkspaceNav from './WorkspaceNav'
import WorkspaceSiteSwitcher from './WorkspaceSiteSwitcher'

const TABS = [
  { to: paths.workspace, label: 'Today', icon: LayoutDashboard, end: true },
  { to: paths.log(), label: 'Log', icon: ClipboardPen, end: false },
  { to: paths.dashboard(), label: 'Dashboards', icon: BarChart3, end: false },
]

const tabClass = (active: boolean) =>
  `relative flex h-full w-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors active:bg-sunken ${
    active ? 'text-ink' : 'text-ink-muted'
  }`

/** Phone tab bar for the workspace: the three daily pages, and Menu for every site tool. */
export default function WorkspaceBottomNav() {
  const role = useRole()
  const [menuOpen, setMenuOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (menuOpen && !dialog.open) dialog.showModal()
    if (!menuOpen && dialog.open) dialog.close()
  }, [menuOpen])

  if (!usesWorkspace(role)) return null

  return (
    <>
      <nav
        aria-label="Workspace shortcuts"
        className="fixed inset-x-0 bottom-0 z-[1000] print:hidden border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid h-16 grid-cols-4">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={({ isActive }) => tabClass(isActive)}>
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
          <li>
            <button type="button" className={tabClass(menuOpen)} aria-haspopup="dialog" onClick={() => setMenuOpen(true)}>
              <Menu className="size-5" strokeWidth={1.75} aria-hidden />
              Menu
            </button>
          </li>
        </ul>
      </nav>

      <dialog
        ref={dialogRef}
        aria-label="Workspace menu"
        onClose={() => setMenuOpen(false)}
        onClick={(e) => {
          // A tap on the backdrop (the dialog itself, not its content) closes it.
          if (e.target === e.currentTarget) setMenuOpen(false)
        }}
        className="m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-2xl bg-surface p-0 text-ink shadow-float backdrop:bg-ink/40 lg:hidden"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <p className="font-display text-xl font-medium">Workspace</p>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex size-12 items-center justify-center rounded-full hover:bg-sunken"
          >
            <X className="size-5" aria-hidden />
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <div className="px-2 py-4">
          <div className="mb-5">
            <WorkspaceSiteSwitcher />
          </div>
          <WorkspaceNav onNavigate={() => setMenuOpen(false)} />
          <Link
            to={paths.explore}
            onClick={() => setMenuOpen(false)}
            className="flex min-h-12 items-center gap-2 px-3 font-semibold text-brand-700"
          >
            Public site
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </dialog>
    </>
  )
}
