import { LoaderCircle } from 'lucide-react'

export default function PageLoading() {
  return (
    <div role="status" className="flex min-h-[40vh] items-center justify-center gap-2 text-ink-muted">
      <LoaderCircle className="size-5 animate-spin" aria-hidden />
      Loading…
    </div>
  )
}
