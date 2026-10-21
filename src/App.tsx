import { SpeedInsights } from '@vercel/speed-insights/react'
import { MotionConfig } from 'motion/react'
import { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import PageLoading from './components/layout/PageLoading'
import {
  CompetitionPage,
  CreditsPage,
  DashboardPage,
  ExplorePage,
  HandoverPage,
  HallCupPage,
  HarvestDashboardPage,
  InboxPage,
  JoinPage,
  JoinSitePage,
  LearnCropPage,
  LearnPage,
  LogFormPage,
  LoginPage,
  LogPage,
  ManageSitePage,
  MyGardensPage,
  NotFoundPage,
  PlantingDashboardPage,
  SiteDetailPage,
  SitesPage,
  TodayPage,
  WorkspaceShell,
} from './pages/lazyPages'
import Redirect from './pages/Redirect'
import { paths } from './lib/paths'

// A data router, so links can use view transitions (Sites → site page photo morph).
// Two layouts: the public side (AppShell) and the committee workspace (WorkspaceShell). Route map: docs/SPEC.md.
const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <ExplorePage /> },
      { path: 'sites', element: <SitesPage /> },
      { path: 'sites/:siteId', element: <SiteDetailPage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'learn/:cropId', element: <LearnCropPage /> },
      { path: 'join', element: <JoinPage /> },
      { path: 'join/:siteId', element: <JoinSitePage /> },
      { path: 'my-gardens', element: <MyGardensPage /> },
      { path: 'hall-cup', element: <HallCupPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'credits', element: <CreditsPage /> },
      // Old URLs: Log and Dashboards moved into the workspace.
      { path: 'log/*', element: <Redirect from="/log" to={paths.log()} /> },
      { path: 'log', element: <Redirect from="/log" to={paths.log()} /> },
      { path: 'dashboard/*', element: <Redirect from="/dashboard" to={paths.dashboard()} /> },
      { path: 'dashboard', element: <Redirect from="/dashboard" to={paths.dashboard()} /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: 'workspace',
    element: (
      <Suspense fallback={<PageLoading />}>
        <WorkspaceShell />
      </Suspense>
    ),
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'log', element: <LogPage /> },
      { path: 'log/:kind', element: <LogFormPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'dashboard/harvest', element: <HarvestDashboardPage /> },
      { path: 'dashboard/planting', element: <PlantingDashboardPage /> },
      { path: 'sites/:siteId/manage', element: <ManageSitePage /> },
      { path: 'sites/:siteId/inbox', element: <InboxPage /> },
      { path: 'sites/:siteId/handover', element: <HandoverPage /> },
      { path: 'competition', element: <CompetitionPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return (
    // reducedMotion="user": every motion component follows the device's reduce-motion setting.
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
      {/* Real-user Core Web Vitals, only on Vercel deployments (its script exists nowhere else). */}
      {__ON_VERCEL__ && <SpeedInsights />}
    </MotionConfig>
  )
}
