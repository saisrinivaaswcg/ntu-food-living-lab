import { useMemo } from 'react'
import { cropNotes, problemLog, protocols } from '../../data'
import { useLogs } from '../../hooks/useLogs'
import { cropYieldsAtSite, sortCropIds } from '../../lib/metrics'
import type { Site } from '../../types'
import EmptyState from '../ui/EmptyState'
import CropCard from './CropCard'
import ProblemLog from './ProblemLog'
import ProtocolList from './ProtocolList'

export default function KnowledgeTab({ site }: { site: Site }) {
  const { logs } = useLogs()
  const yields = useMemo(() => cropYieldsAtSite(logs, site.id), [logs, site.id])
  const notes = useMemo(() => new Map(cropNotes.filter((n) => n.siteId === site.id).map((n) => [n.cropId, n])), [site.id])
  // Crops with notes, plus crops with harvests but no notes yet.
  const cropIds = useMemo(() => sortCropIds([...notes.keys(), ...yields.keys()]), [notes, yields])
  const problems = useMemo(() => problemLog.filter((p) => p.siteId === site.id), [site.id])

  return (
    <div className="space-y-10">
      <section aria-labelledby="crops-heading">
        <h2 id="crops-heading" className="font-display text-section font-medium">
          What grows here
        </h2>
        <p className="mt-1 mb-4 max-w-2xl text-sm text-ink-muted">
          Yield ranges come from every harvest logged at this site. Notes are written by the site committee.
        </p>
        {cropIds.length === 0 ? (
          <EmptyState title="No crops recorded yet" detail="Crops appear here once a harvest is logged or the committee adds notes." />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cropIds.map((id) => (
              <li key={id}>
                <CropCard cropId={id} note={notes.get(id)} yields={yields.get(id)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="problems-heading">
        <h2 id="problems-heading" className="mb-4 font-display text-section font-medium">
          Problem log
        </h2>
        <ProblemLog problems={problems} />
      </section>

      <section aria-labelledby="protocols-heading">
        <h2 id="protocols-heading" className="font-display text-section font-medium">
          Shared protocols
        </h2>
        <p className="mt-1 mb-4 max-w-2xl text-sm text-ink-muted">The same protocols apply at every site.</p>
        <ProtocolList protocols={protocols} />
      </section>
    </div>
  )
}
