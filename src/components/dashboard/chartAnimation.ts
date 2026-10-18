import { useReducedMotion } from 'motion/react'
import { createContext, useContext } from 'react'

/** True for a chart's first mount only, so switching back from the table view doesn't replay it. */
export const ChartAnimationContext = createContext(true)

/** Whether a chart should play its entrance animation. */
export function useChartAnimation(): boolean {
  const first = useContext(ChartAnimationContext)
  const reduce = useReducedMotion()
  return first && !reduce
}
