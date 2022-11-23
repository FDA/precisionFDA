import { database, userFile } from '@pfda/https-apps-shared'
import type { SyncFileStatesJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { Job } from 'bull'
import { UserOpsCtx, WorkerOpsCtx } from '@pfda/https-apps-shared/src/types'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { getChildLogger } from '../utils'

export const syncFileStatesHandler = async (bullJob: Job) => {
  const data = bullJob.data as SyncFileStatesJob
  const requestId = String(bullJob.id)
  const log = getChildLogger(requestId)
  const ctx: WorkerOpsCtx<UserOpsCtx> = {
    em: database.orm().em.fork() as SqlEntityManager,
    log,
    user: data.user,
    job: bullJob,
  }
  await new userFile.SyncFilesStateOperation(ctx).execute()
}
