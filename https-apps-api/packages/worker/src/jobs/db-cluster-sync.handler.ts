import { database, dbCluster } from '@pfda/https-apps-shared'
import type { SyncDbClusterJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { Job } from 'bull'
import { getChildLogger } from '../utils'

export const dbClusterSyncHandler = async (bullJob: Job) => {
  const data = bullJob.data as SyncDbClusterJob
  const requestId = String(bullJob.id)
  const log = getChildLogger(requestId)
  const ctx = {
    em: database.orm().em.fork(),
    log,
    user: data.user,
    job: bullJob,
  }
  await new dbCluster.SyncDbClusterOperation(ctx).execute(data.payload)
}
