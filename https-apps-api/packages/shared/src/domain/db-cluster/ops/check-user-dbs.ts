import P from 'pino'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { Maybe, UserOpsCtx, UserCtx } from '../../../types'
import { DbCluster } from '../db-cluster.entity'
import { PlatformClient } from '../../../platform-client'
import { queue } from '../../..'
import { SyncDbClusterOperation } from './synchronize'


const recreateDbSyncOperationIfMissing = async (dbCluster: DbCluster, log: P.Logger, userCtx: UserCtx): Promise<void> => {
  log.info(`Checking dbcluster ${dbCluster.dxid}, userId ${userCtx.id}, status ${dbCluster.status}`)
  const dbSyncOperation = await queue.findRepeatable(SyncDbClusterOperation.getBullJobId(dbCluster.dxid))
  if (!dbSyncOperation) {
    log.info(
      { dbCluster, userId: userCtx.id },
      'CheckUserDbClustersOperation: Recreating missing DB Cluster sync operation',
    )
    await queue.createDbClusterSyncTask({ dxid: dbCluster.dxid }, userCtx)
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

    this.ctx.log.info(
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
