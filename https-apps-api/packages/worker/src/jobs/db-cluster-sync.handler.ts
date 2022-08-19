import { database, dbCluster } from '@pfda/https-apps-shared'
import type { SyncDbClusterJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { Job } from 'bull'
import { UserOpsCtx, WorkerOpsCtx } from '@pfda/https-apps-shared/src/types'
import { getChildLogger } from '../utils'

export const dbClusterSyncHandler = async (bullJob: Job) => {
  const data = bullJob.data as SyncDbClusterJob
  const requestId = String(bullJob.id)
  const log = getChildLogger(requestId)
  const ctx: WorkerOpsCtx<UserOpsCtx> = {
    // TODO(samuel) fix by declaration merging
    em: database.orm().em.fork() as any,
    log,
    user: data.user,
    job: bullJob,
  }
  await new dbCluster.SyncDbClusterOperation(ctx).execute(data.payload)
}
