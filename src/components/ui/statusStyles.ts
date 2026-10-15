import type { SiteStatus } from '../../types'

/** Badge colours per status. Full class names so Tailwind picks them up. */
export const statusBadgeClass: Record<SiteStatus, string> = {
  active: 'bg-brand-100 text-brand-800',
  'needs-attention': 'bg-attention-bg text-attention',
  establishing: 'bg-establishing-bg text-establishing',
  dormant: 'bg-dormant-bg text-dormant',
}

/** Solid fill for map markers and legend dots. */
export const statusDotClass: Record<SiteStatus, string> = {
  active: 'bg-brand-600',
  'needs-attention': 'bg-attention',
  establishing: 'bg-establishing',
  dormant: 'bg-dormant',
}
