import { path } from 'ramda'
import { queue, errors } from '@pfda/https-apps-shared'
import type { Task } from '@pfda/https-apps-shared/src/queue/task.input'
import { Job } from 'bull'
import { log } from '../utils'
import { jobStatusHandler } from './job-status.handler'
import { sendEmailHandler } from './send-email.handler'
import { checkStaleJobsHandler } from './check-stale-jobs.handler'
import { dbClusterSyncHandler } from './db-cluster-sync.handler'
import { workstationSyncFilesHandler } from './workstation-sync-files.handler'
import { userCheckupHandler } from '../users/user-checkup.handler'
import { testHeapMemoryAllocationError } from 'shared/src/debug'

export const handler = async (job: Job<Task<any>>) => {
  if (typeof path(['data', 'type'], job) === 'undefined') {
    log.warn({ jobData: job.data }, 'Invalid job.data format')
    throw new errors.WorkerError('Job data does not specify task type', { jobData: job.data })
  }

  switch (job.data.type) {
    case queue.TASKS.SYNC_JOB_STATUS:
      await jobStatusHandler(job)
      return await Promise.resolve()
    case queue.TASKS.SYNC_WORKSTATION_FILES:
      await workstationSyncFilesHandler(job)
      return await Promise.resolve()
    case queue.TASKS.SEND_EMAIL:
      await sendEmailHandler(job)
      return await Promise.resolve()
    case queue.TASKS.CHECK_STALE_JOBS:
      // not used at the moment -> the job is never put to queue
      await checkStaleJobsHandler(job)
      return await Promise.resolve()
    case queue.TASKS.SYNC_DBCLUSTER_STATUS:
      await dbClusterSyncHandler(job)
      return await Promise.resolve()
    case queue.TASKS.USER_CHECKUP:
      await userCheckupHandler(job)
      return await Promise.resolve()
    case queue.TASKS.OTHER_TASK:
      console.log('gonna do the other task')
      return await Promise.resolve()
    case queue.TASKS.DEBUG_TEST_MAX_MEMORY:
      await testHeapMemoryAllocationError()
      return await Promise.resolve()
    default:
      log.warn({ jobData: job.data }, 'Trying to handle unsupported task')
      throw new errors.WorkerError('Unsupported task', { jobData: job.data })
  }
}
