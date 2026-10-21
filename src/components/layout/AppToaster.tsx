import { Toaster } from 'sonner'

/** Save, undo and export confirmations, shared by both layouts. Sits above the phone tab bar. */
export default function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      offset={24}
      mobileOffset={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
      toastOptions={{
        classNames: {
          toast: '!rounded-2xl !border-0 !bg-ink !text-canvas !shadow-float !font-sans',
          description: '!text-canvas/80',
          icon: '!text-brand-200',
        },
      }}
    />
  )
}
