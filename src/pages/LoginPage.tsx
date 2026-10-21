import { Info } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import RoleChooser from '../components/access/RoleChooser'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { DEMO_LOGIN_NOTICE } from '../data'
import { usePageTitle } from '../hooks/usePageTitle'
import { landingFor } from '../lib/roles'

/** Only follow ?next= to a page on this site. */
function safeNext(next: string | null): string | null {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null
}

export default function LoginPage() {
  usePageTitle('Choose a role')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Choose a role' }]} />
      <div className="max-w-3xl">
        <h1 className="font-display text-display font-medium">Look around as anyone.</h1>
        <p className="mt-4 text-lg text-ink-muted lg:text-xl">
          Pick a role to see the platform the way a visitor, a student, a site committee or the Sustainability Office
          sees it. You can switch again from the header on any page.
        </p>
      </div>
      <p className="mt-6 flex max-w-3xl items-start gap-2 rounded-sm bg-demo-bg px-4 py-3 text-demo">
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
        <span>
          <strong className="font-semibold">{DEMO_LOGIN_NOTICE}</strong> PINs are shown and pre-filled. Your role is
          remembered in this browser only.
        </span>
      </p>
      <div className="mt-10">
        <RoleChooser onChosen={(role) => navigate(next ?? landingFor(role))} />
      </div>
    </div>
  )
}
