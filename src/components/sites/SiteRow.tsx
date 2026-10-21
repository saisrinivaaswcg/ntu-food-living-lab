import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { siteImage } from '../../data'
import { cropName } from '../../lib/lookups'
import type { CropId, Site } from '../../types'
import Reveal from '../ui/Reveal'
import SlotImage from '../ui/SlotImage'
import DemoSiteTag from '../ui/DemoSiteTag'
import StatusBadge from '../ui/StatusBadge'
import { sitePhotoTransitionName } from './siteTransitions'

interface Props {
  site: Site
  index: number
  growing: CropId[]
}

/**
 * One site as a large image-led row; rows alternate sides on desktop. The whole row is the link;
 * the photo zooms slightly on hover and morphs into the site page's hero when opened.
 */
export default function SiteRow({ site, index, growing }: Props) {
  const flip = index % 2 === 1
  return (
    <Reveal as="li">
      <Link
        to={`/sites/${site.id}`}
        viewTransition
        state={{ viaTransition: true }}
        className="group grid items-center gap-6 lg:grid-cols-12 lg:gap-12"
      >
        <span
          className={`relative block aspect-[16/10] overflow-hidden rounded-2xl shadow-float lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}
          style={{ viewTransitionName: sitePhotoTransitionName(site.id) }}
        >
          <SlotImage
            slot={siteImage(site)}
            title={site.shortName}
            tone={index}
            zoomOnHover
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
        </span>

        <span className={`block lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
          <StatusBadge status={site.status} />
          {site.fictional && <DemoSiteTag />}
          <span className="mt-2 block font-display text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] leading-[1.05] font-medium decoration-brand-700 decoration-2 underline-offset-[6px] group-hover:underline">
            {site.name}
          </span>
          <span className="mt-3 block text-lg text-ink-muted">{site.description}</span>
          <span className="mt-3 flex items-start gap-1.5 text-ink-muted">
            <MapPin className="mt-1 size-4 shrink-0" aria-hidden />
            {site.locationNote}
          </span>
          <span className="mt-5 grid grid-cols-3 border-y border-line py-3">
            <span>
              <span className="block font-display text-3xl font-medium tabular-nums">{site.beds.length}</span>
              <span className="text-sm text-ink-muted">beds</span>
            </span>
            <span className="border-l border-line pl-4">
              <span className="block font-display text-3xl font-medium tabular-nums">{site.areaSqm}</span>
              <span className="text-sm text-ink-muted">m² growing</span>
            </span>
            <span className="border-l border-line pl-4">
              <span className="block font-display text-3xl font-medium tabular-nums">{growing.length}</span>
              <span className="text-sm text-ink-muted">crops now</span>
            </span>
          </span>
          <span className="mt-3 block text-sm text-ink-muted">
            {growing.length ? `Growing ${growing.map(cropName).join(', ')}` : 'Nothing growing right now'}
          </span>
          <span className="mt-5 inline-flex min-h-12 items-center gap-2 font-semibold text-ink">
            Open site
            <span className="flex size-10 items-center justify-center rounded-full bg-ink text-canvas transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </span>
        </span>
      </Link>
    </Reveal>
  )
}
