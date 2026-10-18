import type { ReactNode } from 'react'
import Reveal from '../ui/Reveal'

interface Props {
  id: string
  title: string
  /** One or two plain sentences under the heading. */
  intro?: ReactNode
  /** "split": heading in the left third, content on the right (desktop). "stacked": heading above full-width content. */
  layout?: 'split' | 'stacked'
  children: ReactNode
}

/** A dashboard section: separated by a rule and whitespace, not wrapped in a card. */
export default function DashboardSection({ id, title, intro, layout = 'split', children }: Props) {
  const split = layout === 'split'
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className={`border-t border-line py-10 lg:py-14 ${split ? 'lg:grid lg:grid-cols-12 lg:gap-x-10' : ''}`}
    >
      <Reveal className={split ? 'lg:col-span-4' : 'max-w-3xl'}>
        <h2 id={`${id}-heading`} className="font-display text-section font-medium">
          {title}
        </h2>
        {intro && <div className="mt-2 max-w-prose text-ink-muted">{intro}</div>}
      </Reveal>
      <Reveal delay={0.1} className={`mt-6 min-w-0 ${split ? 'lg:col-span-8 lg:mt-1' : ''}`}>
        {children}
      </Reveal>
    </section>
  )
}
