import { lazy } from 'react'

// Recharts loads in its own chunk, only when a chart scrolls into view.
export const WeeklyLineChart = lazy(() => import('./WeeklyLineChart'))
export const CropBarChart = lazy(() => import('./CropBarChart'))
export const SiteSmallMultiples = lazy(() => import('./SiteSmallMultiples'))
export const WeeklyCountChart = lazy(() => import('./WeeklyCountChart'))
