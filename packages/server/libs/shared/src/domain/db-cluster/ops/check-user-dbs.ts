import { Logger } from '@nestjs/common'
import { createDbClusterSyncTask, findRepeatable } from '@shared/queue'
import { PlatformClient } from '../../../platform-client'
import { Maybe, UserCtx, UserOpsCtx } from '../../../types'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { DbCluster } from '../db-cluster.entity'
import { SyncDbClusterOperation } from './synchronize'

const recreateDbSyncOperationIfMissing = async (
  dbCluster: DbCluster,
  log: Logger,
  userCtx: UserCtx,
): Promise<void> => {
  log.log(`Checking dbcluster ${dbCluster.dxid}, userId ${userCtx.id}, status ${dbCluster.status}`)
  const dbSyncOperation = await findRepeatable(
    SyncDbClusterOperation.getBullJobId(dbCluster.dxid),
  )
  if (!dbSyncOperation) {
    log.log(
      { dbCluster, userId: userCtx.id },
      'Recreating missing DB Cluster sync operation',
    )
    await createDbClusterSyncTask({ dxid: dbCluster.dxid }, userCtx)
  }
}

// Check jobs for a given user, to be run when user logs in to clean up
// old states that are stuck because sync jobs are missing.
export class CheckUserDbClustersOperation extends WorkerBaseOperation<UserOpsCtx,
  never,
  Maybe<DbCluster[]>
> {
  protected client: PlatformClient

  async run(): Promise<Maybe<DbCluster[]>> {
    const em = this.ctx.em
    const dbClusterRepo = em.getRepository(DbCluster)

    const userId = this.ctx.user.id
    const nonTerminatedDbClusters = await dbClusterRepo.find({}, {
      filters: {
        ownedBy: { userId },
        isNonTerminal: {},
      },
    })

    this.ctx.log.log(
      { nonTerminatedDbClusters, userId },
      'CheckUserDbClustersOperation: Found DB Clusters for userId'
    )

    const operations: Array<Promise<void>> = []
    for (const dbCluster of nonTerminatedDbClusters) {
      operations.push(recreateDbSyncOperationIfMissing(dbCluster, this.ctx.log, this.ctx.user))
    }
    await Promise.all(operations)

    return nonTerminatedDbClusters
  }
}
