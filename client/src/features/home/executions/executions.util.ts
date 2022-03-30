import { colors } from '../../../styles/theme'
import { IExecution, jobExecutionPrefix, JobState, workflowExecutionPrefix } from './executions.types'

export function getStateBgColorFromState(state: JobState): string | 'none' {
  switch (state) {
    case 'done':
      return colors.stateDoneBackground
    case 'terminated':
      return colors.stateFailedBackground
    case 'failed':
      return colors.stateFailedBackground
    case 'running':
      return colors.stateRunningBackground
    default:
      break
  }
  return 'none'
}

export const isJobExecution = (execution: IExecution) => {
  return execution.uid.startsWith(jobExecutionPrefix)
}

export const isWorkflowExecution = (execution: IExecution) => {
  return execution.uid.startsWith(workflowExecutionPrefix)
}

export const getExecutionJobsList = (executions: IExecution[]) => {
  const jobs: string[] = []
  for (let execution of executions) {
    if (isJobExecution(execution)) {
      jobs.push(execution.uid)
    }
    else if (isWorkflowExecution(execution) && execution.jobs) {
      jobs.push(...execution.jobs.map(e => e.uid))
    }
    else {
      console.log(`Warning: undetermined execution type ${execution.uid}`)
    }
  }
  return jobs
}
