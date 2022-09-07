import { database, job } from '@pfda/https-apps-shared'
import type { CheckStatusJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { Job } from 'bull'
import { UserOpsCtx, WorkerOpsCtx } from '@pfda/https-apps-shared/src/types'
import { getChildLogger } from '../utils'

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
  await new job.SyncJobOperation(ctx).execute(data.payload)
}
