import type { HelpTask, TaskClaim } from '../types'
import { useCommunity } from './useCommunity'

/** Help-wanted tasks and their claims: demo ones plus those posted and claimed on this device. */
export function useTasks(): { tasks: HelpTask[]; claims: TaskClaim[]; myClaims: TaskClaim[] } {
  const { tasks, claims, myClaims } = useCommunity()
  return { tasks, claims, myClaims }
}
