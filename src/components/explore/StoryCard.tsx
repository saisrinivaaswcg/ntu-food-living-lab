import { imageAsset } from '../../data'
import type { StoryEntry } from './storyTimeline'
import PhotoCaption from '../ui/PhotoCaption'
import SlotImage from '../ui/SlotImage'

/** A garden's photo pinned to the desk like a print: the photo, then the site's name and the photo credit. */
export default function StoryCard({ entry, className = '' }: { entry: StoryEntry; className?: string }) {
  return (
    <figure className={`rounded-[3px] bg-surface p-1.5 shadow-float ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[2px]">
        <SlotImage slot={entry.slot} tone={1} caption="none" sizes="(min-width: 1024px) 15rem, 42vw" />
      </div>
      <figcaption className="px-0.5 pt-1.5 pb-0.5 text-[13px] leading-tight font-semibold text-ink sm:text-sm">
        <span className="sm:hidden">{entry.site.shortName}</span>
        <span className="hidden sm:inline">{entry.site.name}</span>
        {imageAsset(entry.slot.src) && <PhotoCaption slot={entry.slot} variant="line" className="mt-0.5" />}
      </figcaption>
    </figure>
  )
}
