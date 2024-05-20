import { IExecution, jobExecutionPrefix, workflowExecutionPrefix } from './executions.types'

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
