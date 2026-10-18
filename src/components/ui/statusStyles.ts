import type { SiteStatus } from '../../types'

/** Solid fill for map markers, legend keys and status labels. Full class names so Tailwind picks them up. */
export const statusDotClass: Record<SiteStatus, string> = {
  active: 'bg-brand-600',
  'needs-attention': 'bg-attention',
  establishing: 'bg-establishing',
  dormant: 'bg-dormant',
}
