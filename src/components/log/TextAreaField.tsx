import { describedBy, inputClass } from '../../lib/forms'
import Field from './Field'

interface Props {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  optional?: boolean
  placeholder?: string
  hint?: string
  error?: string
}

/** Free text — only for notes and descriptions. Everything else is controlled vocabulary. */
export default function TextAreaField({ id, label, value, onChange, optional, placeholder, hint, error }: Props) {
  return (
    <Field id={id} label={label} optional={optional} hint={hint} error={error}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${inputClass} py-3`}
      />
    </Field>
  )
}
