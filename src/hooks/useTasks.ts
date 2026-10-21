import { demoClaims, demoTasks } from '../data'
import type { HelpTask, TaskClaim } from '../types'

/** Help-wanted tasks and their claims. (Posting and claiming on this device arrive with Get involved.) */
export function useTasks(): { tasks: HelpTask[]; claims: TaskClaim[] } {
  return { tasks: demoTasks, claims: demoClaims }
}
