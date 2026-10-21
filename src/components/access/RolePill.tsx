import { ChevronDown, Info, UserRound } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEMO_LOGIN_NOTICE } from '../../data'
import { useCommunity } from '../../hooks/useCommunity'
import { roleName, roleShortName } from '../../lib/roles'
import RoleChooser from './RoleChooser'

/** "Viewing as: … · Switch" in the header. Opens the four roles in a panel, from any page. */
export default function RolePill() {
  const { role, profile } = useCommunity()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = (returnFocus = true) => {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    // Focus the first control inside, so keyboard users land in the panel.
    panelRef.current?.querySelector<HTMLElement>('button, select, input, a')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) close(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-12 max-w-[11rem] items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-sunken sm:max-w-none"
        data-tour="role-pill"
      >
        <UserRound className="size-4 shrink-0 text-brand-700" aria-hidden />
        <span className="sr-only sm:not-sr-only">Viewing as:</span>
        <span className="truncate font-semibold sm:hidden">{roleShortName(role, profile)}</span>
        <span className="hidden truncate font-semibold sm:inline">{roleName(role, profile)}</span>
        <span className="hidden text-ink-muted sm:inline" aria-hidden>
          ·
        </span>
        <span className="hidden text-brand-700 underline underline-offset-4 sm:inline">Switch</span>
        <span className="sr-only sm:hidden">, switch role</span>
        <ChevronDown className={`size-4 shrink-0 transition-transform sm:hidden ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Switch demo role"
          className="fixed inset-x-2 top-16 z-[1100] max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-card bg-surface p-5 shadow-float sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96"
        >
          <p className="mb-4 flex items-start gap-2 rounded-sm bg-demo-bg px-3 py-2 text-sm text-demo">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            {DEMO_LOGIN_NOTICE}
          </p>
          <RoleChooser compact onChosen={() => close()} />
          <Link
            to="/login"
            onClick={() => close(false)}
            className="mt-4 flex min-h-12 items-center justify-center text-sm font-semibold text-brand-700 underline underline-offset-4"
          >
            What each role can do
          </Link>
        </div>
      )}
    </div>
  )
}
