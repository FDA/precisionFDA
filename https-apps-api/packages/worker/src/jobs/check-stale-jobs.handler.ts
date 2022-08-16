import { database, job, entities, config } from '@pfda/https-apps-shared'
import type { CheckStaleJobsJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { Job } from 'bull'
import { nanoid } from 'nanoid'
import { getChildLogger } from '../utils'

export const checkStaleJobsHandler = async (bullJob: Job<CheckStaleJobsJob>) => {
  const data = bullJob.data
  const requestId = nanoid()
  const log = getChildLogger(requestId)
  // this way we can set up worker operation that needs to run under admin account
  // TODO(samuel) fix by declaration merging
  const em = database.orm().em.fork() as any
  const adminUser = await em.getRepository(entities.User).findAdminUser()
  const adminUserCtx = {
    id: adminUser.id,
    dxuser: adminUser.dxuser,
    accessToken: config.platform.adminUserAccessToken,
  }
  const ctx = {
    em,
    log,
    user: adminUserCtx,
    job: bullJob,
  }
  await new job.CheckStaleJobsOperation(ctx).execute(data.payload)
}
