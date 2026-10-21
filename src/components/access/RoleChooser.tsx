import { Building2, Check, Eye, GraduationCap, Sprout, type LucideIcon } from 'lucide-react'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { ADMIN_TEAM, DEMO_ADMIN_PIN, DEMO_COMMITTEE_PIN, DEMO_STUDENT } from '../../data'
import { useCommunity } from '../../hooks/useCommunity'
import { useLogs } from '../../hooks/useLogs'
import { committeePin, setRole } from '../../lib/communityStore'
import { inputClass } from '../../lib/forms'
import { getLastSiteId } from '../../lib/preferences'
import { notifyError } from '../../lib/notify'
import type { DemoRole, RoleKind, SiteId } from '../../types'

interface Props {
  /** Called after the role is switched. */
  onChosen?: (role: DemoRole) => void
  /** Smaller rows for the header popover; cards everywhere else. */
  compact?: boolean
  /** Only offer these roles (e.g. a workspace page offers committee and admin). */
  only?: RoleKind[]
  /** Pre-select this site on the committee card. */
  preferSiteId?: SiteId
}

const PREFERRED_COMMITTEE_SITE: SiteId = 'hall-12-herb-spice'

/** The four demo roles, each one click away. PINs are pre-filled: this is a demo login, not security. */
export default function RoleChooser({ onChosen, compact = false, only, preferSiteId }: Props) {
  const uid = useId()
  const { role, profile } = useCommunity()
  const { sites } = useLogs()
  const firstSite = (): SiteId => {
    const candidates = [preferSiteId, role.kind === 'committee' ? role.siteId : undefined, getLastSiteId(), PREFERRED_COMMITTEE_SITE]
    return candidates.find((id) => id && sites.some((s) => s.id === id)) ?? sites[0]?.id ?? ''
  }
  const [siteId, setSiteId] = useState<SiteId>(firstSite)
  const [sitePin, setSitePin] = useState(() => committeePin(siteId))
  const [adminPin, setAdminPin] = useState(DEMO_ADMIN_PIN)
  const [pinError, setPinError] = useState<{ for: 'committee' | 'admin'; message: string } | null>(null)

  const choose = (next: DemoRole) => {
    const result = setRole(next)
    if (!result.ok) notifyError(`${result.error} You can still look around as this role until you close the tab.`)
    setPinError(null)
    onChosen?.(next)
  }

  const submitCommittee = (e: FormEvent) => {
    e.preventDefault()
    const expected = committeePin(siteId)
    if (sitePin.trim() !== expected) {
      setPinError({ for: 'committee', message: `That isn't this site's PIN. For the demo it is ${expected}.` })
      return
    }
    choose({ kind: 'committee', siteId })
  }

  const submitAdmin = (e: FormEvent) => {
    e.preventDefault()
    if (adminPin.trim() !== DEMO_ADMIN_PIN) {
      setPinError({ for: 'admin', message: `That isn't the admin PIN. For the demo it is ${DEMO_ADMIN_PIN}.` })
      return
    }
    choose({ kind: 'admin' })
  }

  const show = (kind: RoleKind) => !only || only.includes(kind)
  const student = profile ?? DEMO_STUDENT
  const current = (kind: RoleKind) => role.kind === kind
  const handedOver = committeePin(siteId) !== DEMO_COMMITTEE_PIN

  return (
    <ul className={compact ? 'divide-y divide-line' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'}>
      {show('visitor') && (
        <RoleCard
          compact={compact}
          icon={Eye}
          title="Visitor"
          who="Anyone, no profile"
          can="Browse the map, sites, beds, Learn and the Hall Cup."
          current={current('visitor')}
        >
          <ChooseButton compact={compact} current={current('visitor')} onClick={() => choose({ kind: 'visitor' })}>
            Continue as visitor
          </ChooseButton>
        </RoleCard>
      )}

      {show('student') && (
        <RoleCard
          compact={compact}
          icon={GraduationCap}
          title="Student"
          who={`${student.name}, ${student.hall}${student.source === 'demo' ? ' (demo profile)' : ''}`}
          can="Join communities, claim help-wanted slots, see My gardens, request a hall garden."
          current={current('student')}
        >
          <ChooseButton compact={compact} current={current('student')} onClick={() => choose({ kind: 'student' })}>
            Continue as {student.name.split(' ')[0]}
          </ChooseButton>
        </RoleCard>
      )}

      {show('committee') && (
        <RoleCard
          compact={compact}
          icon={Sprout}
          title="Committee member"
          who="Runs one site"
          can="Log, dashboards, manage the site, help wanted, inbox, handover and impact."
          current={current('committee')}
        >
          <form onSubmit={submitCommittee} className="space-y-3" noValidate>
            <div>
              <label htmlFor={`${uid}-site`} className="mb-1 block text-sm font-semibold">
                Site
              </label>
              <select
                id={`${uid}-site`}
                value={siteId}
                onChange={(e) => {
                  setSiteId(e.target.value)
                  setSitePin(committeePin(e.target.value))
                  setPinError(null)
                }}
                className={`${inputClass} truncate pr-8`}
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <PinField
              id={`${uid}-committee-pin`}
              label={handedOver ? 'Committee PIN (handed over on this device, pre-filled)' : 'Committee PIN (demo, pre-filled)'}
              value={sitePin}
              onChange={(v) => {
                setSitePin(v)
                setPinError(null)
              }}
              error={pinError?.for === 'committee' ? pinError.message : undefined}
            />
            <ChooseButton compact={compact} current={role.kind === 'committee' && role.siteId === siteId} submit>
              Continue as committee
            </ChooseButton>
          </form>
        </RoleCard>
      )}

      {show('admin') && (
        <RoleCard
          compact={compact}
          icon={Building2}
          title="Admin"
          who={ADMIN_TEAM}
          can="Every site, plus approving new sites, competition settings and resetting the demo."
          current={current('admin')}
        >
          <form onSubmit={submitAdmin} className="space-y-3" noValidate>
            <PinField
              id={`${uid}-admin-pin`}
              label="Admin PIN (demo, pre-filled)"
              value={adminPin}
              onChange={(v) => {
                setAdminPin(v)
                setPinError(null)
              }}
              error={pinError?.for === 'admin' ? pinError.message : undefined}
            />
            <ChooseButton compact={compact} current={current('admin')} submit>
              Continue as admin
            </ChooseButton>
          </form>
        </RoleCard>
      )}
    </ul>
  )
}

function RoleCard({
  compact,
  icon: Icon,
  title,
  who,
  can,
  current,
  children,
}: {
  compact: boolean
  icon: LucideIcon
  title: string
  who: string
  can: string
  current: boolean
  children: ReactNode
}) {
  if (compact) {
    return (
      <li className="py-4 first:pt-0 last:pb-0">
        <div className="mb-3 flex items-start gap-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden />
          <div className="min-w-0">
            <p className="font-semibold">
              {title}
              {current && <CurrentTag />}
            </p>
            <p className="text-sm text-ink-muted">{who}</p>
          </div>
        </div>
        {children}
      </li>
    )
  }
  return (
    <li
      className={`flex flex-col rounded-card bg-surface p-5 shadow-card ${current ? 'ring-2 ring-brand-700' : ''}`}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Icon className="size-5" aria-hidden />
      </span>
      <h2 className="mt-4 font-display text-2xl font-medium">
        {title}
        {current && <CurrentTag />}
      </h2>
      <p className="mt-1 text-sm font-semibold text-ink-muted">{who}</p>
      <p className="mt-3 flex-1 text-ink-muted">{can}</p>
      <div className="mt-5">{children}</div>
    </li>
  )
}

function CurrentTag() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 align-middle font-sans text-xs font-semibold text-brand-700">
      <Check className="size-3" aria-hidden />
      Current
    </span>
  )
}

function ChooseButton({
  compact,
  current,
  submit = false,
  onClick,
  children,
}: {
  compact: boolean
  current: boolean
  submit?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      type={submit ? 'submit' : 'button'}
      onClick={onClick}
      className={`flex min-h-12 w-full items-center justify-center rounded-sm px-4 font-semibold transition-colors ${
        current
          ? 'border border-line-strong bg-surface text-ink hover:bg-sunken'
          : 'bg-brand-700 text-white hover:bg-brand-800'
      } ${compact ? 'text-sm' : ''}`}
    >
      {current ? 'Stay in this role' : children}
    </button>
  )
}

function PinField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClass} tabular-nums tracking-[0.2em]`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
