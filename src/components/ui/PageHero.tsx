import type { ReactNode } from 'react'
import { hasIllustration, type ImageSlot } from '../../data'
import Illustration from './Illustration'

/**
 * A public page's header text with its AI illustration beside it (above it on phones). When the
 * illustration file isn't there yet, the header is just the text, exactly as before.
 */
export default function PageHero({ slot, children }: { slot: ImageSlot; children: ReactNode }) {
  if (!hasIllustration(slot)) return <>{children}</>
  return (
    <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-12">
      <div className="relative order-first mx-auto aspect-[4/3] w-full max-w-sm lg:order-last lg:max-w-none">
        <Illustration slot={slot} sizes="(min-width: 1024px) 26rem, 24rem" priority />
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
