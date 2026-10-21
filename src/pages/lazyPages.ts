import { lazy } from 'react'
import { lazyWithPreload } from '../lib/lazyWithPreload'

// Each page is its own chunk, so the map (Leaflet) and the charts (Recharts) only load where they're used.
export const ExplorePage = lazy(() => import('./ExplorePage'))
export const LogPage = lazy(() => import('./workspace/LogPage'))
export const LogFormPage = lazy(() => import('./workspace/LogFormPage'))
export const DashboardPage = lazy(() => import('./workspace/DashboardPage'))
export const HarvestDashboardPage = lazy(() => import('./workspace/HarvestDashboardPage'))
export const PlantingDashboardPage = lazy(() => import('./workspace/PlantingDashboardPage'))
export const SitesPage = lazy(() => import('./SitesPage'))
/** Preloaded from the Sites list so the photo can morph into the site page's hero. */
export const SiteDetailPage = lazyWithPreload(() => import('./SiteDetailPage'))
export const CreditsPage = lazy(() => import('./CreditsPage'))
export const LoginPage = lazy(() => import('./LoginPage'))
export const LearnPage = lazy(() => import('./learn/LearnPage'))
export const LearnCropPage = lazy(() => import('./learn/LearnCropPage'))
export const JoinPage = lazy(() => import('./join/JoinPage'))
export const JoinSitePage = lazy(() => import('./join/JoinSitePage'))
export const MyGardensPage = lazy(() => import('./MyGardensPage'))

// Committee workspace
export const WorkspaceShell = lazy(() => import('../components/workspace/WorkspaceShell'))
export const TodayPage = lazy(() => import('./workspace/TodayPage'))
export const ManageSitePage = lazy(() => import('./workspace/ManageSitePage'))
export const HandoverPage = lazy(() => import('./workspace/HandoverPage'))
export const InboxPage = lazy(() => import('./workspace/InboxPage'))
export const NotFoundPage = lazy(() => import('./NotFoundPage'))
