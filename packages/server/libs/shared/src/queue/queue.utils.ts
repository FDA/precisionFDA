import { Logger } from '@nestjs/common'
import { Job, JobInformation, Queue } from 'bull'
import { removeRepeatableJob } from '.'
import { formatDuration } from '../utils/format'

const getJobStatusMessage = async (job: Job, jobLabel?: string): Promise<string> => {
  const prefix = jobLabel ?? 'Job'
  if (await job.isActive()) {
    return `${prefix} is currently running`
  }
  if (await job.isCompleted()) {
    return `${prefix} has completed`
  }
  if (await job.isDelayed()) {
    return `${prefix} is delayed`
  }
  if (await job.isFailed()) {
    return `${prefix} had failed`
  }
  if (await job.isPaused()) {
    return `${prefix} is paused`
  }
  if (await job.isStuck()) {
    return `${prefix} is stuck`
  }
  if (await job.isWaiting()) {
    return `${prefix} is currently waiting`
  }
  return `${prefix} is in an unknown state`
}

const getJobStatusMessageWithElapsedTime = async (job: Job, jobLabel?: string): Promise<string> => {
  let errorMessage = await getJobStatusMessage(job, jobLabel)
  const elapsedTime = Date.now() - job.timestamp
  errorMessage += `. Current state is ${await job.getState()}`
  errorMessage += `. Elapsed time ${formatDuration(elapsedTime)}`
  return errorMessage
}

// Orphaned repeatable jobs are ones where the 'next' property is in the past relative to
// the current date.
const isJobOrphaned = (jobInfo: JobInformation): boolean => {
  return jobInfo.next < Date.now()
}

const clearOrphanedRepeatableJobs = async (queue: Queue): Promise<JobInformation[]> => {
  const repeatableJobs = await queue.getRepeatableJobs()
  const jobsToRemove = repeatableJobs.filter(job => isJobOrphaned(job))
  await Promise.all(jobsToRemove.map(async job => await removeRepeatableJob(job, queue)))
  return jobsToRemove
}

// state: Any valid bull queue state like 'failed' or 'completed'
const clearJobs = async (q: Queue, state: any, log: Logger): Promise<Job[]> => {
  const jobs = await q.getJobs([state])
  const count = jobs.length
  if (count > 0) {
    log.log({ jobs }, `Removing ${state} jobs from ${q.name}`)
    q.clean(0, state)
    log.log({ count }, `Removed ${count} ${state} jobs from ${q.name}`)
  }
  else {
    log.log(`No ${state} jobs in ${q.name}`)
  }
  return jobs
}

const clearFailedJobs = async (q: Queue, log: Logger): Promise<any> => {
  return await clearJobs(q, 'failed', log)
}

export {
  getJobStatusMessage,
  getJobStatusMessageWithElapsedTime,
  isJobOrphaned,
  clearOrphanedRepeatableJobs,
  clearJobs,
  clearFailedJobs,
}
