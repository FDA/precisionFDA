import { database } from '@shared/database'
import { EmailSendOperation } from '@shared/domain/email/ops/email-send'
import type { SendEmailJob } from '@shared/queue/task.input'
import { Job } from 'bull'
import { nanoid } from 'nanoid'
import { UserOpsCtx, WorkerOpsCtx } from '@shared/types'
import { getChildLogger } from '../utils/logger'

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
    // @ts-ignore
    user: data.user,
    job: bullJob,
  }
  await new EmailSendOperation(ctx).execute(data.payload)
}
