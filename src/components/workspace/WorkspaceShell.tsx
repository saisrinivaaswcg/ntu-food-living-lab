import { ArrowUpRight, Leaf } from 'lucide-react'
import { motion } from 'motion/react'
import { Suspense, useLayoutEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useRole } from '../../hooks/useCommunity'
import { DEMO_DATA_SHORT_NOTICE } from '../../data'
import { paths } from '../../lib/paths'
import { usesWorkspace } from '../../lib/roles'
import { jumpToTop } from '../../lib/smoothScroll'
import RoleGate from '../access/RoleGate'
import RolePill from '../access/RolePill'
import AppToaster from '../layout/AppToaster'
import DemoBanner from '../layout/DemoBanner'
import PageLoading from '../layout/PageLoading'
import WorkspaceBottomNav from './WorkspaceBottomNav'
import WorkspaceNav from './WorkspaceNav'
import WorkspaceSiteSwitcher from './WorkspaceSiteSwitcher'

/**
 * The committee workspace: a denser tool layout with a sidebar, apart from the editorial public side.
 * Visitors and students who open a workspace URL get the committee and admin role cards instead.
 */
export default function WorkspaceShell() {
  const { pathname } = useLocation()
  const role = useRole()

  useLayoutEffect(() => {
    jumpToTop()
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-sm focus:bg-surface focus:px-4 focus:py-3 focus:shadow-float"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-[1000] border-b print:hidden border-line bg-brand-900 text-white">
        <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
          <Link to={paths.workspace} className="flex min-h-12 items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-sm bg-white/10">
              <Leaf className="size-4" aria-hidden />
            </span>
            <span className="leading-tight whitespace-nowrap">
              <span className="hidden font-display text-base font-medium min-[400px]:inline">Omniplant</span>
              <span className="rounded-sm bg-white/15 min-[400px]:ml-2 px-1.5 py-0.5 text-xs font-semibold tracking-wide uppercase">
                Workspace
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-ink">
            <Link
              to={paths.explore}
              className="hidden min-h-12 items-center gap-1 px-2 text-sm font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline md:flex"
            >
              Public site
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
            <RolePill />
          </div>
        </div>
      </header>
      <DemoBanner />

      <div className="flex flex-1">
        {usesWorkspace(role) && (
          <aside className="sticky top-14 hidden print:hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface py-5 lg:flex">
            <WorkspaceSiteSwitcher />
            <div className="mt-6 flex-1 px-2">
              <WorkspaceNav />
            </div>
            <p className="px-5 pt-4 text-xs text-ink-muted">
              <span className="text-demo">{DEMO_DATA_SHORT_NOTICE}</span>{' '}
              <Link to={paths.credits} className="font-semibold text-ink underline underline-offset-4">
                Photo credits
              </Link>
            </p>
          </aside>
        )}

        <main id="main" tabIndex={-1} className="min-w-0 flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] outline-none lg:pb-12 print:pb-0">
          <RoleGate
            allow={['committee', 'admin']}
            what="The workspace"
            why="Logging, dashboards and site tools are for each site's committee and the NTU Sustainability Office."
            className="mx-auto max-w-7xl px-4 py-8 lg:px-8"
          >
            <Suspense fallback={<PageLoading />}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </Suspense>
          </RoleGate>
        </main>
      </div>

      <WorkspaceBottomNav />
      <AppToaster />
    </div>
  )
}
