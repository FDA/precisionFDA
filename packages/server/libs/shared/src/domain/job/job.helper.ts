import { DateTime, Duration, Interval } from 'luxon'
import { config } from '../../config'
import { Job } from './job.entity'
import { ACTIVE_STATES, JOB_STATE, TERMINAL_STATES } from './job.enum'

export const isStateTerminal = (state: string): boolean => Object.values(TERMINAL_STATES).includes(state as JOB_STATE)

export const shouldSyncStatus = (job: Job): boolean => !isStateTerminal(job.state)

export const isStateActive = (state: string): boolean => Object.values(ACTIVE_STATES).includes(state as JOB_STATE)

export const buildIsOverMaxDuration = (terminateOrNotify: 'terminate' | 'notify'): ((job: Job) => boolean) => {
  // which config setting to use
  const seconds =
    terminateOrNotify === 'terminate'
      ? config.workerJobs.syncJob.staleJobsTerminateAfter
      : config.workerJobs.syncJob.staleJobsEmailAfter
  const maxDuration = Duration.fromObject({
    seconds: typeof seconds === 'string' ? parseInt(seconds, 10) : seconds,
  })
  const current = DateTime.now()
  return (job: Job): boolean => {
    const createdAt = DateTime.fromJSDate(job.createdAt)
    const currentJobInterval = Interval.fromDateTimes(createdAt, current)
    return currentJobInterval.toDuration() >= maxDuration
  }
}
