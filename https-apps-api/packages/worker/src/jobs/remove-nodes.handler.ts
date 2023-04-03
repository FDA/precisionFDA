import { Job } from 'bull'
import { database, userFile, job } from '@pfda/https-apps-shared'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { getChildLogger } from '../utils'
import { UserOpsCtx, WorkerOpsCtx } from '@pfda/https-apps-shared/src/types'

export const removeNodesHandler = async (bullJob: Job) => {
  const ids: number[] = bullJob.data.payload as number []

  const requestId = String(bullJob.id)
  const log = getChildLogger(requestId)
  
  const ctx: WorkerOpsCtx<UserOpsCtx> = {
    em: database.orm().em.fork() as SqlEntityManager,
    log,
    user: bullJob.data.user,
    job: bullJob,
  }

  try {
    await new userFile.NodesRemoveOperation(ctx).execute({ ids, async: true })
  } catch (error) {
    await job.sendJobFailedEmails(bullJob.id.toString(), ctx)
  }
}
