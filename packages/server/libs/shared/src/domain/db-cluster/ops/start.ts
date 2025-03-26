import { DxId } from '@shared/domain/entity/domain/dxid'
import { BaseOperation } from '@shared/utils/base-operation'
import { invertObj } from 'ramda'
import * as errors from '../../../errors'
import * as client from '../../../platform-client'
import { DxIdInput, UserOpsCtx } from '../../../types'
import { DbCluster } from '../db-cluster.entity'
import { STATUS, STATUSES } from '../db-cluster.enum'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'

// TODO PFDA-5995: Jarda - get rid of operation, move it to DbCluster service
export class StartDbClusterOperation extends BaseOperation<UserOpsCtx, DxIdInput, DbCluster> {
  async run(input: DxIdInput): Promise<DbCluster> {
    const em = this.ctx.em
    const userClient = new client.PlatformClient(
      { accessToken: this.ctx.user.accessToken },
      this.ctx.log,
    )
    const adminClient = new client.PlatformClient(
      { accessToken: process.env.ADMIN_TOKEN },
      this.ctx.log,
    )
    const dbCluster = await em.findOne(DbCluster, { dxid: input.dxid as DxId<'dbcluster'> })

    if (!dbCluster) {
      throw new errors.DbClusterNotFoundError(`Db Cluster ${input.dxid} is not found`)
    }

    if (dbCluster.status !== STATUS.STOPPED) {
      throw new errors.DbClusterStatusMismatchError(
        'Start action can only be called when the dbcluster is in the "stopped" status',
        { details: { dxid: dbCluster.dxid, status: dbCluster.status } },
      )
    }

    let platformClient = userClient
    const user = await em.findOne(User, { id: this.ctx.user.id })

    if (dbCluster.scope !== STATIC_SCOPE.PRIVATE) {
      const spaceId = dbCluster.getSpaceId()

      const space = await em.findOne(Space, { id: spaceId, state: SPACE_STATE.ACTIVE })
      const membership = await em.findOne(SpaceMembership, {
        spaces: spaceId,
        user: user,
        active: true,
        role: { $ne: SPACE_MEMBERSHIP_ROLE.VIEWER },
      })

      if (space == null || membership == null) {
        this.ctx.log.warn(
          { userId: user.id, space: space, membership: membership },
          'User cannot stop DbCluster - Insufficient privileges.',
        )

        throw new errors.PermissionError('Unable to stop DbCluster in selected context.', {
          statusCode: 401,
        })
      }

      if (space.type === SPACE_TYPE.GROUPS || space.type === SPACE_TYPE.REVIEW) {
        platformClient = adminClient
      }
    }

    const apiResult = await platformClient.dbClusterAction(
      {
        dxid: dbCluster.dxid,
      },
      'start',
    )

    this.ctx.log.log(
      { id: dbCluster.id, dxid: dbCluster.dxid, apiResult },
      'Run start action for DB Cluster',
    )

    const describeResult = await userClient.dbClusterDescribe({
      dxid: dbCluster.dxid,
      project: dbCluster.project,
    })

    // @ts-ignore
    dbCluster.status = STATUS[invertObj(STATUSES)[describeResult.status]]
    await em.fork().persistAndFlush(dbCluster)

    return dbCluster
  }
}
