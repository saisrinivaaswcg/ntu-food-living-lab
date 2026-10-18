/**
 * Toast confirmations. Used only for saves, undos and exports — everything else is shown in place.
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
