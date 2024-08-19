import { DxId } from '@shared/domain/entity/domain/dxid'
import { BaseOperation } from '@shared/utils/base-operation'
import { invertObj } from 'ramda'
import * as errors from '../../../errors'
import * as client from '../../../platform-client'
import { DxIdInput, UserOpsCtx } from '../../../types'
import { DbCluster } from '../db-cluster.entity'
import { STATUS, STATUSES } from '../db-cluster.enum'

export class StopDbClusterOperation extends BaseOperation<UserOpsCtx, DxIdInput, DbCluster> {
  async run(input: DxIdInput): Promise<DbCluster> {
    const em = this.ctx.em
    const platformClient = new client.PlatformClient(
      { accessToken: this.ctx.user.accessToken },
      this.ctx.log,
    )
    const dbCluster = await em.findOne(DbCluster, { dxid: input.dxid as DxId<'dbcluster'> })

    if (!dbCluster) {
      throw new errors.DbClusterNotFoundError(`Db Cluster ${input.dxid} is not found`)
    }

    if (dbCluster.status !== STATUS.AVAILABLE) {
      throw new errors.DbClusterStatusMismatchError(
        'Stop action can only be called when the dbcluster is in the "available" status',
        { details: { dxid: dbCluster.dxid, status: dbCluster.status } },
      )
    }

    const apiResult = await platformClient.dbClusterAction(
      {
        dxid: dbCluster.dxid,
      },
      'stop',
    )

    this.ctx.log.log(
      { id: dbCluster.id, dxid: dbCluster.dxid, apiResult },
      'Run stop action for DB Cluster',
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
