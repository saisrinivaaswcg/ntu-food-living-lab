export type SiteTab = 'knowledge' | 'handover'

export const SITE_TABS: { id: SiteTab; label: string }[] = [
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'handover', label: 'Handover' },
]

export const tabId = (tab: SiteTab) => `site-tab-${tab}`
export const panelId = (tab: SiteTab) => `site-panel-${tab}`
