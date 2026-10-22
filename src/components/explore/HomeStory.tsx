import { useReducedMotion } from 'motion/react'
import { useStoryEntries } from './storyTimeline'
import HomeStoryPinned from './HomeStoryPinned'
import HomeStoryStill from './HomeStoryStill'
import PrimaryActions from './PrimaryActions'

/**
 * Under the Explore hero: how four gardens' separate notebooks became one shared record, and what that
 * record gives back. Pinned with motion, still with reduced motion. Ends on the hero's two doors.
 */
export default function HomeStory() {
  const reduce = useReducedMotion()
  const entries = useStoryEntries()
  return (
    <>
      {reduce ? <HomeStoryStill entries={entries} /> : <HomeStoryPinned entries={entries} />}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-4 lg:px-8 lg:pt-10">
        <p className="max-w-2xl font-display text-section font-medium">Start with an hour, or stay for the term.</p>
        <PrimaryActions tone="paper" className="mt-5" />
      </div>
    </>
  )
}
