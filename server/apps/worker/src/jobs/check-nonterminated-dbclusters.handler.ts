import { database } from '@shared/database'
import {
  CheckNonTerminatedDbClustersOperation
} from '@shared/domain/db-cluster/ops/check-non-terminated'
import type { CheckNonTerminatedDbClustersJob } from '@shared/queue/task.input'
import { Job } from 'bull'
import { getChildLogger } from '../utils/logger'

export const checkNonTerminatedDbClustersHandler = async (bullJob: Job<CheckNonTerminatedDbClustersJob>) => {
  const requestId = String(bullJob.id)
  const log = getChildLogger(requestId)
  const em = database.orm().em.fork()
  const ctx = {
    em,
    log,
    job: bullJob
  }
  await new CheckNonTerminatedDbClustersOperation(ctx as any).execute()

}

