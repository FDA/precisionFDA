import { Job } from 'bull'
import { database, userFile, job } from '@shared'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { getChildLogger } from '../utils'
import { UserOpsCtx, WorkerOpsCtx } from '@shared/types'

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
    await new userFile.NodesUnlockOperation(ctx).execute({ ids, async: true })
  } catch (error) {
    await job.sendJobFailedEmails(bullJob.id.toString(), ctx)
  }
}
