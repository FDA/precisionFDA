import * as errors from '../../../errors'
import { BaseOperation } from '../../../utils'
import * as client from '../../../platform-client'
import { DbCluster } from '../db-cluster.entity'
import { STATUS } from '../db-cluster.enum'
import { DxIdInput } from '@pfda/https-apps-shared/src/types'

export class TerminateDbClusterOperation extends BaseOperation<DxIdInput, DbCluster> {
  async run(input: DxIdInput): Promise<DbCluster> {
    const em = this.ctx.em
    const platformClient = new client.PlatformClient(this.ctx.log)
    const dbCluster = await em.findOne(DbCluster, { dxid: input.dxid })

    if (!dbCluster) {
      throw new errors.DbClusterNotFoundError(`Db Cluster ${input.dxid} is not found`)
    }

    if (dbCluster.status !== STATUS.AVAILABLE) {
      throw new errors.DbClusterStatusMismatchError(
        'Terminate action can only be called when the dbcluster is in the "available" status',
        { details: { dxid: dbCluster.dxid, status: dbCluster.status } }
      )
    }

    const apiResult = await platformClient.dbClusterAction({
      dxid: dbCluster.dxid,
      accessToken: this.ctx.user.accessToken,
    }, 'terminate')

    this.ctx.log.info(
      { dbClusterId: dbCluster.id, dbClusterDxId: dbCluster.dxid, apiResult },
      'Run terminate action for DB Cluster'
    )

    return dbCluster
  }
}
