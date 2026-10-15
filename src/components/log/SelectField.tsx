import { describedBy, inputClass } from '../../lib/forms'
import Field from './Field'

export interface SelectOption<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  id: string
  label: string
  value: T | ''
  onChange: (value: T) => void
  options: SelectOption<T>[]
  placeholder: string
  hint?: string
  error?: string
  disabled?: boolean
}

/** Dropdown fed from the controlled vocabulary in src/data. */
export default function SelectField<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  error,
  disabled,
}: Props<T>) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        value={value}
        // Options come from a typed list, so the value is always one of T.
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${inputClass} truncate pr-8`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
