import { MotionConfig } from 'motion/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import {
  DashboardPage,
  ExplorePage,
  HarvestDashboardPage,
  LogFormPage,
  LogPage,
  NotFoundPage,
  PlantingDashboardPage,
  SiteDetailPage,
  SitesPage,
} from './pages/lazyPages'

// A data router, so links can use view transitions (Sites → site page photo morph).
const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <ExplorePage /> },
      { path: 'log', element: <LogPage /> },
      { path: 'log/:kind', element: <LogFormPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'dashboard/harvest', element: <HarvestDashboardPage /> },
      { path: 'dashboard/planting', element: <PlantingDashboardPage /> },
      { path: 'sites', element: <SitesPage /> },
      { path: 'sites/:siteId', element: <SiteDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return (
    // reducedMotion="user": every motion component follows the device's reduce-motion setting.
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  )
}
