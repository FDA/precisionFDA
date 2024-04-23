import { database } from '@shared/database'
import { WorkstationSyncFilesOperation } from '@shared/domain/user-file/ops/sync-workstation-files'
import type { CheckStatusJob } from '@shared/queue/task.input'
import { Job } from 'bull'
import { nanoid } from 'nanoid'
import { UserOpsCtx, WorkerOpsCtx } from '@shared/types'
import { getChildLogger } from '../utils/logger'

export const workstationSyncFilesHandler = async (bullJob: Job) => {
  const data = bullJob.data as CheckStatusJob
  const requestId = nanoid()
  const log = getChildLogger(requestId)
  // Do we need to validate in the worker when this should be checked by RequestWorkstationFilesSync?
  const ctx: WorkerOpsCtx<UserOpsCtx> = {
    // TODO(samuel) fix by declaration merging
    em: database.orm().em.fork() as any,
    log,
    user: data.user,
    job: bullJob,
  }
  await new WorkstationSyncFilesOperation(ctx).execute(data.payload)
}
