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
      <legend className="mb-1 text-sm font-semibold text-ink">{legend}</legend>
      <div className={`grid gap-1.5 ${columnsClass}`}>
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
              className={`flex min-h-12 flex-col items-center justify-center rounded-sm border bg-surface px-1 py-1.5 text-center text-sm font-medium leading-tight whitespace-nowrap text-ink transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus motion-reduce:active:scale-100 ${
                error ? 'border-danger' : 'border-line-strong hover:border-ink'
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
