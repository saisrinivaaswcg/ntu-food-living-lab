import { sites } from '../../data'
import type { SiteId } from '../../types'
import SelectField from './SelectField'

const siteOptions = sites.map((s) => ({ value: s.id, label: s.name }))

interface Props {
  id: string
  value: SiteId | ''
  onChange: (id: SiteId) => void
  error?: string
}

export default function SiteSelect({ id, value, onChange, error }: Props) {
  return (
    <SelectField
      id={id}
      label="Site"
      value={value}
      onChange={onChange}
      options={siteOptions}
      placeholder="Choose a site"
      error={error}
    />
  )
}
