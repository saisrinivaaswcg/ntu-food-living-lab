import type { Crop, LearnStage } from '../../types'
import { LEARN_STAGES, stageDays } from './journey'

/** One stage's heading, day range and practical steps. */
export default function StageCopy({ crop, stage }: { crop: Crop; stage: LearnStage }) {
  const label = LEARN_STAGES.find((s) => s.stage === stage)?.label ?? stage
  const steps = crop.careGuide.steps[stage]
  return (
    <div>
      <h3 className="font-display text-3xl font-medium lg:text-5xl">{label}</h3>
      <p className="mt-1 text-sm font-semibold text-ink-muted tabular-nums">{stageDays(crop, stage)}</p>
      <ul className="mt-4 max-w-md space-y-2.5 text-[15px] leading-snug sm:text-base lg:mt-5 lg:space-y-3 lg:text-lg">
        {steps.map((step) => (
          <li key={step} className="flex gap-3">
            <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
