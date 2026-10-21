import { ExternalLink } from 'lucide-react'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import SlotImage from '../components/ui/SlotImage'
import { allImageSlots, imageAsset } from '../data'
import { usePageTitle } from '../hooks/usePageTitle'

const linkClass = 'inline-flex min-h-12 items-center gap-1 font-semibold text-ink underline underline-offset-4 hover:text-brand-700'

/** Source, author and licence for every photo, plus the map data. */
export default function CreditsPage() {
  usePageTitle('Photo credits')
  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Photo credits' }]} />
      <h1 className="font-display text-display font-medium">Photo credits</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        Photos are freely licensed from Wikimedia Commons. Photos marked “Representative” show a similar place or
        activity, not the site itself. We resized them, cropped them to fit and converted them to WebP. No photo is
        AI-generated.
      </p>
      <p className="mt-3 max-w-2xl text-ink-muted">
        Illustration: the plant drawings on the Learn pages and elsewhere are drawn in code for this project. Images
        marked “AI illustration” were made by the project team with an AI image tool; none shows a real person or a
        real NTU building.
      </p>

      <ul className="mt-10 border-t border-ink">
        {/* Illustration slots are listed once their file is in place; photo slots always are. */}
        {allImageSlots.filter(({ slot }) => slot.kind !== 'illustration' || imageAsset(slot.src)).map(({ use, slot }) => (
          <li key={slot.src} className="grid gap-4 border-b border-line py-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <SlotImage slot={slot} caption="none" sizes="10rem" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-ink-muted">
                {use}
                {slot.representative && ' · Representative photo'}
              </p>
              {typeof slot.credit === 'string' ? (
                <p className="mt-1 font-display text-xl font-medium">{slot.credit}</p>
              ) : slot.credit ? (
                <>
                  <p className="mt-1 font-display text-xl font-medium">{slot.credit.title}</p>
                  <p className="mt-1">
                    By {slot.credit.author}, licensed {slot.credit.license}. {slot.credit.changes}.
                  </p>
                  <p className="flex flex-wrap gap-x-5">
                    <a href={slot.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      Original on Wikimedia Commons
                      <ExternalLink className="size-4" aria-hidden />
                    </a>
                    <a href={slot.credit.licenseUrl} target="_blank" rel="noopener noreferrer license" className={linkClass}>
                      Licence {slot.credit.license}
                      <ExternalLink className="size-4" aria-hidden />
                    </a>
                  </p>
                </>
              ) : (
                <p className="mt-1">Our own photo.</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-section font-medium">Map data</h2>
      <p className="mt-3 max-w-2xl text-ink-muted">
        Map tiles from OneMap, © Singapore Land Authority. Satellite imagery: Esri, Vantor, Earthstar Geographics,
        and the GIS User Community. Credits also appear on the map itself.
      </p>
    </div>
  )
}
