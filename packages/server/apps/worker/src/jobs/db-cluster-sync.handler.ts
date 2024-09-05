import { database } from '@shared/database'
import { SyncDbClusterOperation } from '@shared/domain/db-cluster/ops/synchronize'
import type { SyncDbClusterJob } from '@shared/queue/task.input'
import { Job } from 'bull'
import { UserOpsCtx, WorkerOpsCtx } from '@shared/types'
import { getChildLogger } from '../utils/logger'

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
  await new SyncDbClusterOperation(ctx).execute(data.payload)
}
