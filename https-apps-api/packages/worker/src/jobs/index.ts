import { SqlEntityManager } from '@mikro-orm/mysql'
import { getChildLogger } from '../utils'
import { path } from 'ramda'
import {
  database,
  debug,
  errors,
  job as jobDomain,
  queue,
  user,
  userFile,
} from '@pfda/https-apps-shared'
import { UserOpsCtx, WorkerOpsCtx } from '@pfda/https-apps-shared/src/types'
import { Job } from 'bull'
import { log } from '../utils'
import { userCheckupHandler } from './user-checkup.handler'
import { jobStatusHandler } from './job-status.handler'
import { sendEmailHandler } from './send-email.handler'
import { checkStaleJobsHandler } from './check-stale-jobs.handler'
import { dbClusterSyncHandler } from './db-cluster-sync.handler'
import { workstationSyncFilesHandler } from './workstation-sync-files.handler'
import { checkNonTerminatedDbClustersHandler } from './check-nonterminated-dbclusters.handler'
import { syncSpacesPermissionsHandler } from './sync-spaces-permissions.handler'
import { checkUserJobsHandler } from './check-user-jobs.handler'
import { removeNodesHandler } from './remove-nodes.handler'


type WorkerContext = WorkerOpsCtx<UserOpsCtx>

// A replacement for writing individual handler functions that differ only by
// the line creating and executing the Operation
const handleUserTask = async <TJob extends queue.types.TaskWithAuth> (
  bullJob: Job,
  execute: (ctx: WorkerContext, input: any) => Promise<any>,
) => {
  const data = bullJob.data as TJob
  const requestId = String(bullJob.id)
  const log = getChildLogger(requestId)
  const ctx: WorkerOpsCtx<UserOpsCtx> = {
    em: database.orm().em.fork() as SqlEntityManager,
    log,
    user: data.user,
    job: bullJob,
  }
  await execute(ctx, data.payload)
}


export const handler = async (job: Job<queue.types.Task>) => {
  if (typeof path(['data', 'type'], job) === 'undefined') {
    log.warn({ jobData: job.data }, 'Invalid job.data format')
    throw new errors.WorkerError('Job data does not specify task type', { jobData: job.data })
  }

  // TODO - Refactor into a registry, with task to handler mapping, e.g.
  //        const handler = handlerRegistry.get(job.data.type)
  //        handler.invoke(job)
  switch (job.data.type) {
    // ----------
    // User Tasks
    // ----------
    case queue.types.TASK_TYPE.SYNC_FILES_STATE:
      await handleUserTask(job, async (ctx, input) => {
        return await new userFile.SyncFilesStateOperation(ctx).execute(input)
      })
      return
    case queue.types.TASK_TYPE.SYNC_JOB_STATUS:
      await jobStatusHandler(job)
      return
    case queue.types.TASK_TYPE.SYNC_WORKSTATION_FILES:
      await workstationSyncFilesHandler(job)
      return
    case queue.types.TASK_TYPE.WORKSTATION_SNAPSHOT:
      await handleUserTask(job, async (ctx, input) => {
        return await new jobDomain.WorkstationSnapshotOperation(ctx).execute(input)
      })
      return
    case queue.types.TASK_TYPE.SEND_EMAIL:
      await sendEmailHandler(job)
      return
    case queue.types.TASK_TYPE.CHECK_STALE_JOBS:
      // not used at the moment -> the job is never put to queue
      // TODO(samuel) - typescript fix discriminated union type resolution, to avoid "as any"
      await checkStaleJobsHandler(job as any)
      return
    case queue.types.TASK_TYPE.REMOVE_NODES:
      await removeNodesHandler(job)
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
