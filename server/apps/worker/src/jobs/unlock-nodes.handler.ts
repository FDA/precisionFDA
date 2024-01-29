import { database } from '@shared/database'
import { sendJobFailedEmails } from '@shared/domain/job/job.helper'
import { NodesUnlockOperation } from '@shared/domain/user-file/ops/node-unlock'
import { Job } from 'bull'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserOpsCtx, WorkerOpsCtx } from '@shared/types'
import { getChildLogger } from '../utils/logger'

export const unlockNodesHandler = async (bullJob: Job) => {
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
    await new NodesUnlockOperation(ctx).execute({ ids, async: true })
  } catch (error) {
    await sendJobFailedEmails(bullJob.id.toString(), ctx)
  }
}
