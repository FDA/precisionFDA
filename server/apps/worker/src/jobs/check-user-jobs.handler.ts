import { database } from '@shared/database'
import { CheckUserJobsOperation } from '@shared/domain/job/ops/check-user-jobs'
import type { BasicUserJob } from '@shared/queue/task.input'
import { Job } from 'bull'
import { nanoid } from 'nanoid'
import { getChildLogger } from '../utils/logger'

export const checkUserJobsHandler = async (bullJob: Job) => {
  const data = bullJob.data as BasicUserJob
  const requestId = nanoid()
  const log = getChildLogger(requestId)
  const em = database.orm().em.fork()
  const ctx = {
    em,
    log,
    user: data.user,
    job: bullJob,
  }

  await new CheckUserJobsOperation(ctx as any).execute()
}
