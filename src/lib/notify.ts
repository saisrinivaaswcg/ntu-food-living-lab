/**
 * Toast confirmations. Used only for saves (including edits and deletes), undos and exports.
 * One <Toaster /> lives in the app shell.
 */
import { toast } from 'sonner'

export function notifySaved(what: string): void {
  toast.success(`${what} saved`, { description: 'Already counted on the dashboard.' })
}

export function notifyUndone(what: string): void {
  toast(`${what} removed`, { description: 'Your entries are still in the form.' })
}

export function notifyExported(count: number, noun: string): void {
  toast.success(`Exported ${count} ${noun}`, { description: 'The CSV file is in your downloads.' })
}

/** A saved change with an Undo button in the toast (edits, deletes, site setup). */
export function notifyChange(title: string, undo?: () => void, description?: string): void {
  toast.success(title, {
    description,
    action: undo ? { label: 'Undo', onClick: undo } : undefined,
    duration: undo ? 8000 : 4000,
  })
}

/** A failed save, shown in place of the confirmation. */
export function notifyError(message: string): void {
  toast.error(message)
}
