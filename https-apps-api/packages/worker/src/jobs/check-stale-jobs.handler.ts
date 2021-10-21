import { database, job, entities, config } from '@pfda/https-apps-shared'
import type { CheckStaleJobsJob } from '@pfda/https-apps-shared/src/queue/task.input'
import type { UserCtx, WorkerOpsCtx } from '@pfda/https-apps-shared/src/types'
import { Job } from 'bull'
import { nanoid } from 'nanoid'
import { getChildLogger } from '../utils'

export const checkStaleJobsHandler = async (bullJob: Job) => {
  const data = bullJob.data as CheckStaleJobsJob
  const requestId = nanoid()
  const log = getChildLogger(requestId)
  // this way we can set up worker operation that needs to run under admin account
  const em = database.orm().em.fork()
  const adminUser = await em.getRepository(entities.User).findAdminUser()
  const adminUserCtx: UserCtx = {
    id: adminUser.id,
    dxuser: adminUser.dxuser,
    accessToken: config.platform.adminUserAccessToken,
  }
  const ctx: WorkerOpsCtx = {
    em,
    log,
    user: adminUserCtx,
    job: bullJob,
  }
  await new job.CheckStaleJobsOperation(ctx).execute(data.payload)
}
