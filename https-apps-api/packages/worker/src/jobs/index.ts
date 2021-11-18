import { path } from 'ramda'
import { queue, errors } from '@pfda/https-apps-shared'
import type { Task } from '@pfda/https-apps-shared/src/queue/task.input'
import { Job } from 'bull'
import { log } from '../utils'
import { jobStatusHandler } from './job-status.handler'
import { sendEmailHandler } from './send-email.handler'
import { checkStaleJobsHandler } from './check-stale-jobs.handler'

export const handler = async (job: Job<Task<any>>) => {
  if (typeof path(['data', 'type'], job) === 'undefined') {
    log.warn({ jobData: job.data }, 'Invalid job.data format')
    throw new errors.WorkerError('Job data does not specify task type', { jobData: job.data })
  }

  log.debug({ jobData: job.data }, 'nodejs-worker about to handle job')

  switch (job.data.type) {
    case queue.TASKS.SYNC_JOB_STATUS:
      await jobStatusHandler(job)
      return await Promise.resolve()
    case queue.TASKS.SEND_EMAIL:
      await sendEmailHandler(job)
      return await Promise.resolve()
    case queue.TASKS.CHECK_STALE_JOBS:
      // not used at the moment -> the job is never put to queue
      await checkStaleJobsHandler(job)
      return await Promise.resolve()
    case queue.TASKS.OTHER_TASK:
      console.log('gonna do the other task')
      return await Promise.resolve()
    default:
      log.warn({ jobData: job.data }, 'Trying to handle unsupported task')
      throw new errors.WorkerError('Unsupported task', { jobData: job.data })
  }
}
