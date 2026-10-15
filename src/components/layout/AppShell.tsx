import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import DemoBanner from './DemoBanner'
import TopNav from './TopNav'

export default function AppShell() {
  const { pathname } = useLocation()

  // New page → start at the top (query-string changes, like selecting a site, keep the scroll).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-3 focus:shadow-card"
      >
        Skip to content
      </a>
      <TopNav />
      <DemoBanner />
      <main id="main" tabIndex={-1} className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] outline-none lg:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
