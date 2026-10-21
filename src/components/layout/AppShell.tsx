import { motion } from 'motion/react'
import { Suspense, useLayoutEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { jumpToTop } from '../../lib/smoothScroll'
import AppToaster from './AppToaster'
import BottomNav from './BottomNav'
import DemoBanner from './DemoBanner'
import Footer from './Footer'
import PageLoading from './PageLoading'
import TopNav from './TopNav'

export default function AppShell() {
  const { pathname, state } = useLocation()
  // Links that use a view transition (Sites → site page) animate through it, not this fade.
  const viaTransition = (state as { viaTransition?: boolean } | null)?.viaTransition === true
  // No fade on the very first page: it would hold back the first paint (and LCP) for nothing.
  const [firstPage] = useState(pathname)
  const fade = !viaTransition && firstPage !== pathname

  // New page → start at the top (query-string changes, like selecting a site, keep the scroll).
  // Layout effect: runs before a view transition captures the new page.
  useLayoutEffect(() => {
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
      {/* At least a screen tall, so the footer starts below the fold and never jumps when a page loads in. */}
      <main id="main" tabIndex={-1} className="min-h-dvh flex-1 outline-none">
        {/* Pages load as separate chunks; the nav and banner stay in place meanwhile. */}
        <Suspense fallback={<PageLoading />}>
          {/* Opacity only: a transform here would break position: fixed inside pages while it runs. */}
          <motion.div
            key={pathname}
            initial={fade ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
      <AppToaster />
    </div>
  )
}
