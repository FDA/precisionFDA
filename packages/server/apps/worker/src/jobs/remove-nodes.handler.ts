import { SqlEntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { NodesRemoveOperation } from '@shared/domain/user-file/ops/nodes-remove'
import { UserOpsCtx, WorkerOpsCtx } from '@shared/types'
import { Job } from 'bull'
import { getChildLogger } from '../utils/logger'

export const removeNodesHandler = async (bullJob: Job) => {
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
    await new NodesRemoveOperation(ctx).execute({ ids, async: true })
  } catch (error) {
    log.error('Remove nodes handler failed', error)
  }
}
