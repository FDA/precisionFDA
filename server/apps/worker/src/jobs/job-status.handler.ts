import { database } from '@shared/database'
import { SyncJobOperation } from '@shared/domain/job/ops/synchronize'
import type { CheckStatusJob } from '@shared/queue/task.input'
import { Job } from 'bull'
import { UserOpsCtx, WorkerOpsCtx } from '@shared/types'
import { getChildLogger } from '../utils/logger'

export const jobStatusHandler = async (bullJob: Job) => {
  const data = bullJob.data as CheckStatusJob
  // This used to be nanoid(), but it makes it hard to track in the logs which
  // operation invocation is assocated with which task requests in
  const requestId = String(bullJob.id)
  const log = getChildLogger(requestId)
  // this is like a router endpoint
  // validation ??
  // build context
  const ctx: WorkerOpsCtx<UserOpsCtx> = {
    // TODO(samuel) fix by declaration merging
    em: database.orm().em.fork() as any,
    log,
    user: data.user,
    job: bullJob,
  }
  await new SyncJobOperation(ctx).execute(data.payload)
}
