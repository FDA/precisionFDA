import { User } from '../user'
import { InternalError } from '../../errors'
import { APP_HTTPS_SUBTYPE } from '../app/app.enum'
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

const getJobSubtype = (job: Job, user: User): APP_HTTPS_SUBTYPE => {
  if (job.user.id !== user.id) {
    throw new InternalError('getJobSubtype: Job user.id does not equal to the provided user.id')
  }
  const jobProject = job.project
  if (jobProject === user.jupyterProject) {
    return APP_HTTPS_SUBTYPE.JUPYTER
  } else if (jobProject === user.ttydProject) {
    return APP_HTTPS_SUBTYPE.TTYD
  } else {
    // return shiny
  }
  throw new InternalError('Job project dxid did not match any of the users projects', {
    userId: user.id,
    jobId: job.id,
  })
}

export { shouldSyncStatus, isStateTerminal, getJobSubtype }
