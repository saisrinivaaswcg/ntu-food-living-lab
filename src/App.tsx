import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'

// Each page is its own chunk, so the map (Leaflet) and the charts (Recharts) only load where they're used.
const ExplorePage = lazy(() => import('./pages/ExplorePage'))
const LogPage = lazy(() => import('./pages/LogPage'))
const LogFormPage = lazy(() => import('./pages/LogFormPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const SitesPage = lazy(() => import('./pages/SitesPage'))
const SiteDetailPage = lazy(() => import('./pages/SiteDetailPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<ExplorePage />} />
          <Route path="log" element={<LogPage />} />
          <Route path="log/:kind" element={<LogFormPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sites" element={<SitesPage />} />
          <Route path="sites/:siteId" element={<SiteDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
