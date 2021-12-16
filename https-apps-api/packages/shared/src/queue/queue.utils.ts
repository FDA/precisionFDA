import { Job } from "bull";


export const getJobStatusMessage = (job: Job, jobLabel?: string) => {
  const prefix = jobLabel ?? 'Job'
  if (job.isActive()) {
    return `${prefix} is currently running`
  }
  if (job.isCompleted()) {
    return `${prefix} has completed`
  }
  if (job.isDelayed()) {
    return `${prefix} is delayed`
  }
  if (job.isFailed()) {
    return `${prefix} had failed`
  }
  if (job.isPaused()) {
    return `${prefix} is paused`
  }
  if (job.isStuck()) {
    return `${prefix} is stuck`
  }
  if (job.isWaiting()) {
    return `${prefix} is currently waiting`
  }
  return `${prefix} is in an unknown state`
}
