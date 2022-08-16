import { database, job } from '@pfda/https-apps-shared'
import type { BasicUserJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { Job } from 'bull'
import { nanoid } from 'nanoid'
import { getChildLogger } from '../utils'

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

  await new job.CheckUserJobsOperation(ctx as any).execute()
}
