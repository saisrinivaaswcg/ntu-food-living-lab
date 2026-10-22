import { SCATTER, SCENES, type StoryEntry } from './storyTimeline'
import StoryCard from './StoryCard'
import StoryNote from './StoryNote'
import StoryOutcomes from './StoryOutcomes'
import StoryRecord from './StoryRecord'

/**
 * The home story with reduced motion: nothing pins or moves. Three still steps, in the same order: the
 * scattered photos with their notes, the shared record with its rows, then the three outcomes.
 */
export default function HomeStoryStill({ entries }: { entries: StoryEntry[] }) {
  const step = (i: number) => (
    <div className="lg:col-span-5">
      <h3 className="font-display text-section font-medium">{SCENES[i].title}</h3>
      <p className="mt-2 max-w-xl text-ink-muted lg:text-lg">{SCENES[i].text}</p>
    </div>
  )
  return (
    <section aria-labelledby="story-heading" className="mx-auto max-w-7xl px-4 pt-10 lg:px-8 lg:pt-16">
      <h2 id="story-heading" className="sr-only">
        From four notebooks to one shared record
      </h2>
      <ol className="divide-y divide-line border-b border-line">
        <li className="grid gap-6 py-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-12">
          {step(0)}
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:col-span-7 lg:grid-cols-2 lg:gap-x-10">
            {entries.map((entry, i) => (
              <li key={entry.site.id} style={{ rotate: `${SCATTER[i % SCATTER.length].rotate}deg` }}>
                <StoryCard entry={entry} />
                <StoryNote
                  text={entry.note}
                  siteName={entry.site.name}
                  className={`relative mt-2 ${i % 2 ? 'mr-auto -rotate-3' : 'ml-auto rotate-3'}`}
                />
              </li>
            ))}
          </ul>
        </li>
        <li className="grid gap-6 py-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-12">
          {step(1)}
          <div className="[container-type:inline-size] lg:col-span-7">
            <StoryRecord entries={entries} />
          </div>
        </li>
        <li className="grid gap-6 py-8 lg:grid-cols-12 lg:gap-12 lg:py-12">
          {step(2)}
          <StoryOutcomes className="lg:col-span-7" />
        </li>
      </ol>
    </section>
  )
}
