import { ExecutionListItem, IExecution, JobState } from './executions.types'

const jobExecutionPrefix = 'job-'
const workflowExecutionPrefix = 'workflow-'
const httpsAppStateTagPrefix = 'pfda_httpsAppState_enabled'

export function isJobExecution(execution: IExecution): boolean {
  return execution.uid.startsWith(jobExecutionPrefix)
}

export function isWorkflowExecution(execution: IExecution): boolean {
  return execution.uid.startsWith(workflowExecutionPrefix)
}

export function getExecutionJobsList(executions: IExecution[]): string[] {
  const jobs: string[] = []
  for (const execution of executions) {
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

const TERMINAL_STATES: JobState[] = ['terminated', 'done', 'failed']

export function getUserLink(dxuser: string): string {
  return `/users/${dxuser}`
}

export function getOpenExternalUrl(uid: string): string {
  return `/api/jobs/${uid}/open_external`
}

export function isOpenExternalAvailable(execution: IExecution): boolean {
  if (execution.entityType !== 'https' || execution.state !== 'running') {
    return false
  }

  const requiresHttpsAppState =
    execution.platformTags?.some(tag => tag.startsWith(httpsAppStateTagPrefix)) ?? false

  if (!requiresHttpsAppState) {
    return true
  }

  return execution.httpsAppState === 'running'
}

export function isPublishable(execution: IExecution | ExecutionListItem, loggedDxuser?: string): boolean {
  if ('isPublishable' in execution) {
    return execution.isPublishable
  }

  // Fallback while all execution endpoints are being aligned.
  return (
    execution.scope === 'private' &&
    TERMINAL_STATES.includes(execution.state) &&
    execution.launchedByDxuser === loggedDxuser
  )
}
