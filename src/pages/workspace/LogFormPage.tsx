import { Navigate, useParams } from 'react-router-dom'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import { findLogFormKind } from '../../components/log/logFormKinds'
import { usePageTitle } from '../../hooks/usePageTitle'
import { paths } from '../../lib/paths'
import NotFoundPage from '../NotFoundPage'

export default function LogFormPage() {
  const { kind } = useParams()
  const form = findLogFormKind(kind)
  usePageTitle(form ? `Log ${form.title.toLowerCase()}` : 'Form not found')

  // The losses form used to be called "failure"; keep old links working.
  if (kind === 'failure') return <Navigate to={paths.log('losses')} replace />

  if (!form) {
    return (
      <NotFoundPage
        title="Form not found"
        message={`There is no "${kind ?? ''}" form. You can log a harvest, planting, weekly inputs or plant losses.`}
      />
    )
  }

  const { Form } = form
  return (
    <div className="mx-auto max-w-xl px-4 pt-1 lg:py-6">
      <Breadcrumbs items={[{ label: 'Log', to: paths.log() }, { label: form.title }]} className="mb-0" />
      {/* key: switching between forms starts a fresh one */}
      <Form key={form.slug} />
    </div>
  )
}
