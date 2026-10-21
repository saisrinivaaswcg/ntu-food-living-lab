import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useRole } from '../../hooks/useCommunity'
import { notifyChange } from '../../lib/notify'
import { resetDemoData } from '../../lib/resetDemo'
import ConfirmDialog from '../ui/ConfirmDialog'

/** Admin only: put this device back to the demo data as shipped. */
export default function ResetDemoCard() {
  const role = useRole()
  const [asking, setAsking] = useState(false)

  return (
    <section aria-labelledby="reset-heading" className="rounded-card bg-surface p-5 shadow-card">
      <h2 id="reset-heading" className="font-semibold">
        Reset demo data
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Removes every log, edit, bed setup, profile and request made on this device, and brings back the demo data as
        it shipped. You stay signed in as Admin.
      </p>
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-sm border border-danger px-4 font-semibold text-danger hover:bg-danger-bg"
      >
        <RotateCcw className="size-4" aria-hidden />
        Reset demo data
      </button>
      <ConfirmDialog
        open={asking}
        title="Reset all demo data?"
        body="Everything done on this device goes: logs, edits, beds, profiles, joins and requests. This can't be undone."
        confirmLabel="Reset everything"
        danger
        onCancel={() => setAsking(false)}
        onConfirm={() => {
          resetDemoData(role)
          setAsking(false)
          notifyChange('Demo data reset', undefined, 'This device is back to the demo data as shipped.')
        }}
      />
    </section>
  )
}
