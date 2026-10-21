import HandoverTab from '../../components/sites/HandoverTab'
import ReadOnlyNotice from '../../components/workspace/ReadOnlyNotice'
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader'
import { DEMO_DATA_SHORT_NOTICE } from '../../data'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useWorkspaceSite } from '../../hooks/useWorkspaceSite'
import NotFoundPage from '../NotFoundPage'

/** The committee's handover record for one site: current leads, open issues, checklist and history. */
export default function HandoverPage() {
  const { site, canEdit } = useWorkspaceSite()
  usePageTitle(site ? `${site.shortName} handover` : 'Site not found')
  if (!site) return <NotFoundPage title="Site not found" message="There is no site with that name. Pick one from the site switcher." />

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-8">
      <WorkspaceHeader
        crumbs={[{ label: site.shortName }, { label: 'Handover' }]}
        title="Handover"
        lead={
          <>
            {site.name}: what the next committee needs to know. <span className="text-demo">{DEMO_DATA_SHORT_NOTICE}</span>
          </>
        }
      />
      {!canEdit && <ReadOnlyNotice site={site} tool="handover" />}
      <HandoverTab site={site} />
    </div>
  )
}
