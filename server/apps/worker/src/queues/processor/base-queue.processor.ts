import { SqlEntityManager } from '@mikro-orm/mysql'
import { database, queue } from '@shared'
import { UserOpsCtx, WorkerOpsCtx } from '@shared/types'
import { Job } from 'bull'
import { getChildLogger } from '../../utils'

type WorkerContext = WorkerOpsCtx<UserOpsCtx>

/**
 * @deprecated used by old non-DI-integrated job processors
 */
export abstract class BaseQueueProcessor {
  protected async handleUserTask<TJob extends queue.types.TaskWithAuth>(
    bullJob: Job,
    execute: (ctx: WorkerContext, input: any) => Promise<any>,
  ) {
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
}
