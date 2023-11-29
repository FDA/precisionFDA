import { database, dbCluster } from '@shared'
import type { CheckNonTerminatedDbClustersJob } from '@shared/queue/task.input'
import { Job } from 'bull'
import { getChildLogger } from '../utils'

export const checkNonTerminatedDbClustersHandler = async (bullJob: Job<CheckNonTerminatedDbClustersJob>) => {
  const requestId = String(bullJob.id)
  const log = getChildLogger(requestId)
  const em = database.orm().em.fork()
  const ctx = {
    em,
    log,
    job: bullJob
  }
  await new dbCluster.CheckNonTerminatedDbClustersOperation(ctx as any).execute()

}

