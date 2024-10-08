import { invertObj } from 'ramda'
import * as errors from '../../../errors'
import { BaseOperation } from '../../../utils'
import * as client from '../../../platform-client'
import { DbCluster } from '../db-cluster.entity'
import { STATUS, STATUSES } from '../db-cluster.enum'
import { DxIdInput, UserOpsCtx } from '../../../types'

export class TerminateDbClusterOperation extends BaseOperation<UserOpsCtx, DxIdInput, DbCluster> {
  async run(input: DxIdInput): Promise<DbCluster> {
    const em = this.ctx.em
    const platformClient = new client.PlatformClient(this.ctx.user.accessToken, this.ctx.log)
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
    }, 'terminate')

    this.ctx.log.info(
      { id: dbCluster.id, dxid: dbCluster.dxid, apiResult },
      'Run terminate action for DB Cluster'
    )

    const describeResult = await platformClient.dbClusterDescribe({
      dxid: dbCluster.dxid,
      project: dbCluster.project,
    })

    // @ts-ignore
    dbCluster.status = STATUS[invertObj(STATUSES)[describeResult.status]]
    await em.fork().persistAndFlush(dbCluster)

    return dbCluster
  }
}
