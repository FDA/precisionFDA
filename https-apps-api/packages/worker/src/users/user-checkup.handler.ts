import { database, job, dbCluster } from '@pfda/https-apps-shared'
import type { BasicUserJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { Job } from 'bull'
import { nanoid } from 'nanoid'
import { getChildLogger } from '../utils'


// This is a composite job, consisting of various checks that we can do
// to a user's account. This should be triggered when user logs in with means
// we have a new platform accessToken to work with
export const userCheckupHandler = async (bullJob: Job) => {
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

  log.info({
    id: data.user.id,
    dxuser: data.user.dxuser,
  }, 'Starting user checkup')

  // TODO(samuel) typescript fix
  await new job.CheckUserJobsOperation(ctx as any).execute()
  await new dbCluster.CheckUserDbClustersOperation(ctx as any).execute()

  log.info({
    id: data.user.id,
    dxuser: data.user.dxuser,
  }, 'Completed user checkup')
}
