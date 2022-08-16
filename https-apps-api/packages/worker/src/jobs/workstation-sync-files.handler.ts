import { database, userFile } from '@pfda/https-apps-shared'
import type { CheckStatusJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { Job } from 'bull'
import { nanoid } from 'nanoid'
import { UserOpsCtx, WorkerOpsCtx } from '@pfda/https-apps-shared/src/types'
import { getChildLogger } from '../utils'

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
  await new userFile.WorkstationSyncFilesOperation(ctx).execute(data.payload)
}
