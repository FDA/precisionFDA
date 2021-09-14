import { DateTime, Duration, Interval } from 'luxon'
import { config } from '../../config'
import { Job } from './job.entity'
import { ACTIVE_STATES, JOB_STATE, TERMINAL_STATES } from './job.enum'

const isStateTerminal = (state: string): boolean =>
  Object.values(TERMINAL_STATES).includes(state as JOB_STATE)

const shouldSyncStatus = (job: Job): boolean => {
  if (isStateTerminal(job.state)) {
    // the job has already ended and PFDA knows of it
    return false
  }
  return true
}

const isStateActive = (state: string): boolean =>
  Object.values(ACTIVE_STATES).includes(state as JOB_STATE)

const buildIsOverMaxDuration = (
  terminateOrNotify: 'terminate' | 'notify',
): ((job: Job) => boolean) => {
  // which config setting to use
  const seconds =
    terminateOrNotify === 'terminate'
      ? config.workerJobs.syncJob.staleJobsTerminateAfter
      : config.workerJobs.syncJob.staleJobsEmailAfter
  const maxDuration = Duration.fromObject({ seconds })
  const current = DateTime.now()
  return (job: Job): boolean => {
    const createdAt = DateTime.fromJSDate(job.createdAt)
    const currentJobInterval = Interval.fromDateTimes(createdAt, current)
    if (currentJobInterval.toDuration() >= maxDuration) {
      return true
    }
    return false
  }
}

export { shouldSyncStatus, isStateTerminal, buildIsOverMaxDuration, isStateActive }
