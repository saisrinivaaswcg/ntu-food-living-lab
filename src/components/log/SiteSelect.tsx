import { useRole } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { editableSites } from '../../lib/roles'
import type { SiteId } from '../../types'
import SelectField from './SelectField'

interface Props {
  id: string
  value: SiteId | ''
  onChange: (id: SiteId) => void
  error?: string
}

/** The sites this role can log for: a committee's own site, or every site for Admin. */
export default function SiteSelect({ id, value, onChange, error }: Props) {
  const role = useRole()
  const { sites } = useLogs()
  const options = editableSites(role, sites).map((s) => ({ value: s.id, label: s.name }))
  return (
    <SelectField
      id={id}
      label="Site"
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Choose a site"
      hint={role.kind === 'committee' ? 'Committee members log for their own site.' : undefined}
      error={error}
    />
  )
}
