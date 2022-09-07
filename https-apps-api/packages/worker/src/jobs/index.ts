import { path } from 'ramda'
import { queue, errors, debug } from '@pfda/https-apps-shared'
import { Job } from 'bull'
import { log } from '../utils'
import { userCheckupHandler } from '../users/user-checkup.handler'
import { jobStatusHandler } from './job-status.handler'
import { sendEmailHandler } from './send-email.handler'
import { checkStaleJobsHandler } from './check-stale-jobs.handler'
import { dbClusterSyncHandler } from './db-cluster-sync.handler'
import { workstationSyncFilesHandler } from './workstation-sync-files.handler'
import { checkNonTerminatedDbClustersHandler } from './check-nonterminated-dbclusters.handler'
import { syncSpacesPermissionsHandler } from './sync-spaces-permissions.handler'
import { checkUserJobsHandler } from './check-user-jobs.handler'


export const handler = async (job: Job<queue.types.Task>) => {
  if (typeof path(['data', 'type'], job) === 'undefined') {
    log.warn({ jobData: job.data }, 'Invalid job.data format')
    throw new errors.WorkerError('Job data does not specify task type', { jobData: job.data })
  }

  switch (job.data.type) {
    case queue.types.TASK_TYPE.SYNC_JOB_STATUS:
      await jobStatusHandler(job)
      return
    case queue.types.TASK_TYPE.SYNC_WORKSTATION_FILES:
      await workstationSyncFilesHandler(job)
      return
    case queue.types.TASK_TYPE.SEND_EMAIL:
      await sendEmailHandler(job)
      return
    case queue.types.TASK_TYPE.CHECK_STALE_JOBS:
      // not used at the moment -> the job is never put to queue
      // TODO(samuel) - typescript fix discriminated union type resolution, to avoid "as any"
      await checkStaleJobsHandler(job as any)
      return
    case queue.types.TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS:
      await checkNonTerminatedDbClustersHandler(job as any)
      return
    case queue.types.TASK_TYPE.SYNC_DBCLUSTER_STATUS:
      await dbClusterSyncHandler(job)
      return
    case queue.types.TASK_TYPE.SYNC_SPACES_PERMISSIONS:
      await syncSpacesPermissionsHandler(job as any)
      return
    case queue.types.TASK_TYPE.USER_CHECKUP:
      await userCheckupHandler(job)
      return
    case queue.types.TASK_TYPE.CHECK_USER_JOBS:
      await checkUserJobsHandler(job)
      return
    case queue.types.TASK_TYPE.DEBUG_MAX_MEMORY:
      await debug.testHeapMemoryAllocationError()
      return
    default:
      log.warn({ jobData: job.data }, 'Trying to handle unsupported task')
      throw new errors.WorkerError('Unsupported task', { jobData: job.data })
  }
}
