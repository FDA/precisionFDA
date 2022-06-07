import { database } from '@pfda/https-apps-shared'
import type { CheckStatusJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { Job } from 'bull'
import { nanoid } from 'nanoid'
import { getChildLogger } from '../utils'
import { userFile } from '@pfda/https-apps-shared'

export const workstationSyncFilesHandler = async (bullJob: Job) => {
  const data = bullJob.data as CheckStatusJob
  const requestId = nanoid()
  const log = getChildLogger(requestId)
  // Do we need to validate in the worker when this should be checked by RequestWorkstationFilesSync?
  const ctx = {
    em: database.orm().em.fork(),
    log,
    user: data.user,
    job: bullJob,
  }
  await new userFile.WorkstationSyncFilesOperation(ctx).execute(data.payload)
}
