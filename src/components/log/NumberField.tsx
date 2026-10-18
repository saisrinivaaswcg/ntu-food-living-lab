import { Minus, Plus } from 'lucide-react'
import { describedBy, formatDecimal, inputClass, parseDecimal } from '../../lib/forms'
import Field from './Field'

interface Props {
  id: string
  label: string
  /** Raw text, so a half-typed "1." isn't wiped out. Parse with parseDecimal. */
  value: string
  onChange: (value: string) => void
  step: number
  unit: string
  /** Decimal places allowed; 0 = whole numbers only. */
  decimals: number
  min?: number
  hint?: string
  error?: string
  disabled?: boolean
  /** Bigger text for the field people use most (harvest weight). */
  large?: boolean
}

/** Number input with − / + steppers. Uses inputMode instead of type="number" so phones show the right keypad and commas work. */
export default function NumberField({
  id,
  label,
  value,
  onChange,
  step,
  unit,
  decimals,
  min = 0,
  hint,
  error,
  disabled,
  large,
}: Props) {
  const current = parseDecimal(value)

  const nudge = (direction: 1 | -1) => {
    const next = Math.max(min, (current ?? 0) + direction * step)
    onChange(formatDecimal(next, decimals))
  }

  const stepLabel = `${formatDecimal(step, decimals)} ${unit}`
  const buttonClass = `flex shrink-0 items-center justify-center rounded-sm border border-line-strong bg-surface text-ink transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-95 active:bg-sunken disabled:border-line disabled:text-ink-subtle disabled:hover:bg-surface motion-reduce:active:scale-100 ${
    large ? 'size-14' : 'size-12'
  }`

  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => nudge(-1)}
          disabled={disabled || current === null || current <= min}
          aria-label={`Decrease ${label.toLowerCase()} by ${stepLabel}`}
          className={buttonClass}
        >
          <Minus className="size-5" aria-hidden />
        </button>
        <div className="relative min-w-0 flex-1">
          <input
            id={id}
            type="text"
            inputMode={decimals > 0 ? 'decimal' : 'numeric'}
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, hint, error)}
            className={`${inputClass} pr-12 text-center font-semibold tabular-nums ${large ? 'min-h-14 text-2xl' : ''}`}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink-muted" aria-hidden>
            {unit}
          </span>
        </div>
        <button
          type="button"
          onClick={() => nudge(1)}
          disabled={disabled}
          aria-label={`Increase ${label.toLowerCase()} by ${stepLabel}`}
          className={buttonClass}
        >
          <Plus className="size-5" aria-hidden />
        </button>
      </div>
    </Field>
  )
}
