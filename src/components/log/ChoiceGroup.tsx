export interface Choice<T extends string | number> {
  value: T
  label: string
  hint?: string
}

interface Props<T extends string | number> {
  /** Used as the radio group name; the first option gets this id so errors can focus it. */
  id: string
  legend: string
  choices: Choice<T>[]
  value: T | null
  onChange: (value: T) => void
  error?: string
  /** Grid columns, e.g. "grid-cols-4" */
  columnsClass: string
}

/** Big tap targets instead of a dropdown. Native radios underneath, so arrow keys and screen readers work. */
export default function ChoiceGroup<T extends string | number>({
  id,
  legend,
  choices,
  value,
  onChange,
  error,
  columnsClass,
}: Props<T>) {
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-1 text-sm font-medium text-ink">{legend}</legend>
      <div className={`grid gap-2 ${columnsClass}`}>
        {choices.map((choice, i) => (
          <label key={String(choice.value)} className="block cursor-pointer">
            <input
              type="radio"
              id={i === 0 ? id : undefined}
              name={id}
              className="peer sr-only"
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
              aria-invalid={error ? true : undefined}
            />
            <span
              className={`flex min-h-12 flex-col items-center justify-center rounded-xl border-2 bg-surface px-1.5 py-1.5 text-center text-sm font-medium leading-tight text-ink transition-colors peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-800 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-2 ${
                error ? 'border-danger/60' : 'border-line hover:border-brand-300'
              }`}
            >
              {choice.label}
              {choice.hint && <span className="mt-0.5 text-xs font-normal text-ink-muted">{choice.hint}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  )
}
