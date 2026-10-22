import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { DEMO_COMMITTEE_SITE, exploreHeroImage, exploreHeroVideo, imageAsset, videoAsset } from '../../data'
import { paths } from '../../lib/paths'
import CommitteeViewLink from '../access/CommitteeViewLink'
import PhotoCaption from '../ui/PhotoCaption'
import SlotImage from '../ui/SlotImage'
import HappeningNow from './HappeningNow'
import PrimaryActions from './PrimaryActions'

const textLink =
  'inline-flex min-h-12 items-center gap-1.5 font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white'

/**
 * Full-width photo (or muted loop) with the headline over it. Static on purpose: no pin, no scroll
 * effects and no entrance animation, so it paints at once and nothing shifts. On phones the two buttons
 * sit on the first screen; the home story under it does the moving.
 */
export default function ExploreHero({ mapId }: { mapId: string }) {
  const reduce = useReducedMotion()
  const [videoFailed, setVideoFailed] = useState(false)
  // Only when the file exists (known at build time), so there is never a failed request.
  const videoSrc = videoAsset(exploreHeroVideo.src)
  const poster = imageAsset(exploreHeroVideo.poster.src)?.src

  return (
    <section
      aria-labelledby="explore-heading"
      className="relative isolate flex min-h-[calc(100svh-7.5rem)] flex-col justify-end overflow-hidden bg-ink text-white lg:min-h-[min(88vh,52rem)]"
    >
      <div className="absolute inset-0 -z-10">
        <SlotImage slot={exploreHeroImage} tone={0} labelAt="top-right" caption="none" priority />
        {videoSrc && !reduce && !videoFailed && (
          <video
            className="absolute inset-0 size-full object-cover"
            src={videoSrc}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
            onError={() => setVideoFailed(true)}
          />
        )}
      </div>
      {imageAsset(exploreHeroImage.src) && <PhotoCaption slot={exploreHeroImage} className="absolute top-3 right-3 z-10" />}
      {/* Scrim so white text stays above 4.5:1 over any photo. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink/90 via-ink/60 to-ink/10" aria-hidden />

      <div className="mx-auto w-full max-w-7xl px-4 pt-16 pb-6 sm:pt-24 lg:px-8 lg:pb-12">
        <div className="max-w-4xl">
          <h1
            id="explore-heading"
            className="font-display text-[clamp(2.5rem,1.6rem+5.4vw,6rem)] leading-[0.98] font-medium tracking-[-0.025em]"
          >
            Campus and hall gardens. One shared record.
          </h1>
          <p className="mt-4 max-w-2xl text-white/90 sm:mt-5 sm:text-lg lg:text-xl">
            Every harvest, planting and loss at NTU’s food gardens is logged the same way, so what one student committee
            learns, the next one keeps.
          </p>
          <PrimaryActions tone="photo" className="mt-6 sm:mt-8" />
          <ul className="mt-1 flex flex-wrap gap-x-6 text-sm">
            <li>
              <a href={`#${mapId}`} className={textLink}>
                Find a site on the map
                <ArrowDown className="size-4" aria-hidden />
              </a>
            </li>
            <li className="flex items-center gap-2">
              <CommitteeViewLink to={paths.siteTool(DEMO_COMMITTEE_SITE, 'handover')} scope="site" className={textLink}>
                See the committee view
                <ArrowUpRight className="size-4" aria-hidden />
              </CommitteeViewLink>
              <span className="rounded-sm bg-white/15 px-1.5 py-0.5 text-xs font-semibold" aria-hidden>
                Demo role
              </span>
            </li>
          </ul>
        </div>

        <HappeningNow />
      </div>
    </section>
  )
}
