import { database, email } from '@pfda/https-apps-shared'
import type { SendEmailJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { Job } from 'bull'
import { nanoid } from 'nanoid'
import { UserOpsCtx, WorkerOpsCtx } from '@pfda/https-apps-shared/src/types'
import { getChildLogger } from '../utils'

export const sendEmailHandler = async (bullJob: Job) => {
  const data = bullJob.data as SendEmailJob
  const requestId = nanoid()
  const log = getChildLogger(requestId)
  // this is like a router endpoint
  // validation ??
  // build context
  const ctx: WorkerOpsCtx<UserOpsCtx> = {
    // TODO(samuel) fix by declaration merging
    em: database.orm().em.fork() as any,
    log,
    user: data.user,
    job: bullJob,
  }
  await new email.EmailSendOperation(ctx).execute(data.payload)
}
