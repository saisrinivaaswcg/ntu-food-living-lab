import { motion } from 'motion/react'
import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { jumpToTop, startSmoothScroll } from '../../lib/smoothScroll'
import BottomNav from './BottomNav'
import DemoBanner from './DemoBanner'
import PageLoading from './PageLoading'
import TopNav from './TopNav'

export default function AppShell() {
  const { pathname } = useLocation()
  // Log pages are used outdoors against the clock: keep their transition short.
  const quick = pathname.startsWith('/log')

  useEffect(() => startSmoothScroll(), [])

  // New page → start at the top (query-string changes, like selecting a site, keep the scroll).
  useEffect(() => {
    jumpToTop()
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-sm focus:bg-surface focus:px-4 focus:py-3 focus:shadow-float"
      >
        Skip to content
      </a>
      <TopNav />
      <DemoBanner />
      <main id="main" tabIndex={-1} className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] outline-none lg:pb-0">
        {/* Pages load as separate chunks; the nav and banner stay in place meanwhile. */}
        <Suspense fallback={<PageLoading />}>
          {/* Opacity only: a transform here would break position: fixed inside pages while it runs. */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: quick ? 0.15 : 0.4, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
      <BottomNav />
    </div>
  )
}
