import { Link } from 'react-router-dom'
import { DEMO_DATA_SHORT_NOTICE } from '../../data'
import { paths } from '../../lib/paths'

const links = [
  { to: paths.sites, label: 'Sites' },
  { to: paths.join, label: 'Join a community' },
  { to: paths.myGardens, label: 'My gardens' },
  { to: paths.credits, label: 'Photo credits' },
]

/** Site footer: credits and the demo-data reminder. Leaves room for the phone tab bar. */
export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>
          NTU Campus Food Systems Living Lab · prototype. <span className="text-demo">{DEMO_DATA_SHORT_NOTICE}</span>
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-4">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="inline-flex min-h-12 items-center font-semibold text-ink underline underline-offset-4 hover:text-brand-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
