import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import ExplorePage from './pages/ExplorePage'
import LogPage from './pages/LogPage'
import NotFoundPage from './pages/NotFoundPage'
import SiteDetailPage from './pages/SiteDetailPage'
import SitesPage from './pages/SitesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<ExplorePage />} />
          <Route path="log" element={<LogPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sites" element={<SitesPage />} />
          <Route path="sites/:siteId" element={<SiteDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
