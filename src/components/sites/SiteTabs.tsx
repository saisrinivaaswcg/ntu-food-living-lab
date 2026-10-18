import { useRef, type KeyboardEvent } from 'react'
import { SITE_TABS, panelId, tabId, type SiteTab } from './siteTabItems'

interface Props {
  active: SiteTab
  onChange: (tab: SiteTab) => void
}

/** ARIA tabs: arrow keys, Home and End move between tabs (automatic activation). */
export default function SiteTabs({ active, onChange }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = SITE_TABS.findIndex((t) => t.id === active)
    const last = SITE_TABS.length - 1
    const next =
      e.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null
    if (next === null) return
    e.preventDefault()
    onChange(SITE_TABS[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label="Site information" onKeyDown={onKeyDown} className="flex gap-1 border-b border-line">
      {SITE_TABS.map((tab, i) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={tabId(tab.id)}
            aria-selected={selected}
            aria-controls={panelId(tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`-mb-px min-h-12 border-b-2 px-4 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ${
              selected ? 'border-brand-700 text-brand-800' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
