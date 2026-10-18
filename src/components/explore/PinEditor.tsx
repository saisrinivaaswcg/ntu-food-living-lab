import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import type { Site, SiteId } from '../../types'

/** Same format the coordinates were supplied in, so they can be pasted straight back. */
function formatPin(site: Pick<Site, 'name' | 'coordinates'>): string {
  return `${site.name}: <${site.coordinates[0]}, ${site.coordinates[1]}>`
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard blocked (e.g. not a secure context): the text stays selectable in the box.
    return false
  }
}

/**
 * Pin-placement helper, only shown at /?editPins=1. Pins are draggable there; this box shows where
 * each one now sits, with buttons to copy the coordinates.
 */
export default function PinEditor({ sites, moved }: { sites: Site[]; moved: Set<SiteId> }) {
  const [status, setStatus] = useState('')

  async function copy(text: string, label: string) {
    setStatus((await copyText(text)) ? `Copied ${label}` : 'Copy failed — select the text and copy it by hand')
  }

  return (
    <section
      aria-labelledby="pin-editor-heading"
      className="fixed top-20 left-4 z-[1100] w-[min(26rem,calc(100vw-2rem))] rounded-2xl bg-surface/95 p-4 text-sm shadow-float backdrop-blur"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="pin-editor-heading" className="font-semibold">
          Pin placement
        </h2>
        <button
          type="button"
          onClick={() => copy(sites.map(formatPin).join('\n'), 'all pins')}
          className="inline-flex min-h-12 items-center gap-1.5 rounded-sm bg-ink px-3 font-semibold text-canvas hover:bg-brand-800"
        >
          <Copy className="size-4" aria-hidden />
          Copy all
        </button>
      </div>
      <p className="mt-1 text-ink-muted">Drag a pin to move it. Nothing is saved; copy the coordinates and send them on.</p>
      <ul className="mt-3 divide-y divide-line">
        {sites.map((site) => (
          <li key={site.id} className="flex items-center gap-2 py-2">
            <span className="min-w-0 flex-1 select-all break-words">
              <span className="font-semibold">{site.name}</span>
              {moved.has(site.id) && <span className="ml-1 text-accent-strong">(moved)</span>}
              <span className="block text-ink-muted tabular-nums">
                {site.coordinates[0]}, {site.coordinates[1]}
              </span>
            </span>
            <button
              type="button"
              onClick={() => copy(formatPin(site), site.name)}
              aria-label={`Copy ${site.name} coordinates`}
              className="flex size-12 shrink-0 items-center justify-center rounded-sm text-ink hover:bg-sunken"
            >
              <Copy className="size-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex min-h-5 items-center gap-1.5 text-ink-muted" aria-live="polite">
        {status && <Check className="size-4" aria-hidden />}
        {status}
      </p>
    </section>
  )
}
