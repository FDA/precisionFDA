import { database, job } from '@pfda/https-apps-shared'
import type { CheckStatusJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { WorkerOpsCtx } from '@pfda/https-apps-shared/src/types'
import { Job } from 'bull'
import { log } from '../utils'

export const jobStatusHandler = async (bullJob: Job) => {
  const data = bullJob.data as CheckStatusJob
  // this is like a router endpoint
  // validation ??
  // build context
  const ctx: WorkerOpsCtx = {
    em: database.orm().em.fork(),
    // todo: http pino instance?
    log,
    user: data.user,
    job: bullJob,
  }
  await new job.SyncJobOperation(ctx).execute(data.payload)
}
