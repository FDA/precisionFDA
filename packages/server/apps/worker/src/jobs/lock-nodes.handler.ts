import { SqlEntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { sendJobFailedEmails } from '@shared/domain/job/job.helper'
import { NodesLockOperation } from '@shared/domain/user-file/ops/node-lock'
import { UserOpsCtx, WorkerOpsCtx } from '@shared/types'
import { Job } from 'bull'
import { getChildLogger } from '../utils/logger'

export const lockNodesHandler = async (bullJob: Job) => {
  const ids: number[] = bullJob.data.payload as number[]

  const requestId = String(bullJob.id)
  const log = getChildLogger(requestId)

  const ctx: WorkerOpsCtx<UserOpsCtx> = {
    em: database.orm().em.fork() as SqlEntityManager,
    log,
    user: bullJob.data.user,
    job: bullJob,
  }

  try {
    await new NodesLockOperation(ctx).execute({ ids, async: true })
  } catch (error) {
    await sendJobFailedEmails(bullJob.id.toString(), ctx)
  }
}
