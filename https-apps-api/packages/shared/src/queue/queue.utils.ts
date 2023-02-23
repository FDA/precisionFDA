import { Logger } from 'pino'
import Bull, { Job, JobInformation, Queue } from 'bull'
import { removeRepeatableJob } from '.'


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
    log.info({ jobs }, `CleanupWorkerQueueOperation: Removing ${state} jobs from ${q.name}`)
    q.clean(0, state);
    log.info({ count }, `CleanupWorkerQueueOperation: Removed ${count} ${state} jobs from ${q.name}`)
  }
  else {
    log.info(`CleanupWorkerQueueOperation: No ${state} jobs in ${q.name}`)
  }
  return jobs
}

const clearFailedJobs = async (q: Queue, log: Logger): Promise<any> => {
  return await clearJobs(q, 'failed', log)
}

const clearCompletedJobs = async (q: Queue, log: Logger): Promise<any> => {
  return await clearJobs(q, 'completed', log)
}

export {
  getJobStatusMessage,
  isJobOrphaned,
  clearOrphanedRepeatableJobs,
  clearJobs,
  clearFailedJobs,
  clearCompletedJobs,
}
