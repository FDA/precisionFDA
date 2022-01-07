import { database, job } from '@pfda/https-apps-shared'
import type { BasicUserJob } from '@pfda/https-apps-shared/src/queue/task.input'
import type { WorkerOpsCtx } from '@pfda/https-apps-shared/src/types'
import { Job } from 'bull'
import { nanoid } from 'nanoid'
import { getChildLogger } from '../utils'


// This is a composite job, consisting of various checks that we can do
// to a user's account. This should be triggered when user logs in with means
// we have a new accessToken to platform to work with
export const userCheckupHandler = async (bullJob: Job) => {
  const data = bullJob.data as BasicUserJob
  const requestId = nanoid()
  const log = getChildLogger(requestId)
  const em = database.orm().em.fork()
  const ctx: WorkerOpsCtx = {
    em,
    log,
    user: data.user,
    job: bullJob,
  }

  await new job.CheckUserJobsOperation(ctx).execute(data.payload)
  // Add more operations when necessary
}
