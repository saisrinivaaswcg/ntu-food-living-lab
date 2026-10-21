/**
 * Every in-app URL in one place, so moving a page means changing one line. Route map: docs/SPEC.md →
 * Routes and roles.
 */
import type { SiteId } from '../types'

/** Workspace pages that belong to one site: /workspace/sites/:siteId/:tool */
export type SiteTool = 'manage' | 'tasks' | 'inbox' | 'handover' | 'impact' | 'grow' | 'qr'

export const paths = {
  explore: '/',
  sites: '/sites',
  site: (siteId: SiteId) => `/sites/${siteId}`,
  learn: '/learn',
  learnCrop: (cropId: string) => `/learn/${cropId}`,
  join: '/join',
  joinSite: (siteId: SiteId) => `/join/${siteId}`,
  myGardens: '/my-gardens',
  getInvolved: '/get-involved',
  hallCup: '/hall-cup',
  bed: (siteId: SiteId, bedId: string) => `/bed/${siteId}/${encodeURIComponent(bedId)}`,
  startGarden: '/start-a-garden',
  startGardenRequest: '/start-a-garden/request',
  login: '/login',
  credits: '/credits',

  workspace: '/workspace',
  log: (kind?: string) => (kind ? `/workspace/log/${kind}` : '/workspace/log'),
  dashboard: (tab?: 'harvest' | 'planting') => (tab ? `/workspace/dashboard/${tab}` : '/workspace/dashboard'),
  siteTool: (siteId: SiteId, tool: SiteTool) => `/workspace/sites/${siteId}/${tool}`,
  approvals: '/workspace/approvals',
  competition: '/workspace/competition',
}

/** Pre-filled harvest form for one bed (from "Ready soon" cards and bed pages). */
export function harvestFormFor(siteId: SiteId, bedId: string, cropId?: string): string {
  const q = new URLSearchParams({ site: siteId, bed: bedId, ...(cropId ? { crop: cropId } : {}) })
  return `${paths.log('harvest')}?${q}`
}
