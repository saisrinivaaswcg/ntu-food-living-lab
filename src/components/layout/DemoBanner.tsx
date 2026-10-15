import { Info } from 'lucide-react'
import { DEMO_DATA_NOTICE } from '../../data'

export default function DemoBanner() {
  return (
    <div role="note" aria-label="Demonstration data" className="border-b border-demo/20 bg-demo-bg">
      <p className="mx-auto flex max-w-7xl items-start gap-2 px-4 py-2 text-xs text-demo sm:text-sm lg:px-8">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        {DEMO_DATA_NOTICE}
      </p>
    </div>
  )
}
