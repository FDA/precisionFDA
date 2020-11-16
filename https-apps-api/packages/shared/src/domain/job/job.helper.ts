import { Job } from './job.entity'
import { JOB_STATE, TERMINAL_STATES } from './job.enum'

const isStateTerminal = (state: string): boolean =>
  Object.values(TERMINAL_STATES).includes(state as JOB_STATE)

const shouldSyncStatus = (job: Job): boolean => {
  if (isStateTerminal(job.state)) {
    // the job has already ended and PFDA knows of it
    return false
  }
  return true
}

export { shouldSyncStatus, isStateTerminal }
