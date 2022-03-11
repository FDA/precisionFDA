import { JobState } from './executions.types'

export function getStateBgColorFromState(state: JobState): string | 'none' {
  switch (state) {
    case 'done':
      return '#DFF0DA'
    case 'terminated':
      return '#ffeeed'
    case 'failed':
      return '#ffeeed'
    case 'running':
      return '#f0f9fd'
    default:
      break
  }
  return 'none'
}
