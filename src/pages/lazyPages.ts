import { lazy } from 'react'
import { lazyWithPreload } from '../lib/lazyWithPreload'

// Each page is its own chunk, so the map (Leaflet) and the charts (Recharts) only load where they're used.
export const ExplorePage = lazy(() => import('./ExplorePage'))
export const LogPage = lazy(() => import('./LogPage'))
export const LogFormPage = lazy(() => import('./LogFormPage'))
export const DashboardPage = lazy(() => import('./DashboardPage'))
export const HarvestDashboardPage = lazy(() => import('./HarvestDashboardPage'))
export const PlantingDashboardPage = lazy(() => import('./PlantingDashboardPage'))
export const SitesPage = lazy(() => import('./SitesPage'))
/** Preloaded from the Sites list so the photo can morph into the site page's hero. */
export const SiteDetailPage = lazyWithPreload(() => import('./SiteDetailPage'))
export const CreditsPage = lazy(() => import('./CreditsPage'))
export const NotFoundPage = lazy(() => import('./NotFoundPage'))
