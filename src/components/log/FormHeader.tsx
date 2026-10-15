import { Undo2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  title: string
  /** Rendered on the right of the title row, e.g. the collapsed date. */
  aside?: ReactNode
  /** Shown after Undo: the record is gone but the form keeps its values. */
  undoneMessage?: string | null
}

export default function FormHeader({ title, aside, undoneMessage }: Props) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-3">
        <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">{title}</h1>
        {aside}
      </div>
      {undoneMessage && (
        <p role="status" className="flex items-start gap-2 rounded-xl bg-demo-bg px-3 py-2 text-sm text-demo">
          <Undo2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          {undoneMessage}
        </p>
      )}
    </>
  )
}
