import { Job, JobInformation, Queue } from 'bull'
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

export {
  getJobStatusMessage,
  isJobOrphaned,
  clearOrphanedRepeatableJobs,
}
