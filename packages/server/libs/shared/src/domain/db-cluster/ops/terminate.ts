import { DxId } from '@shared/domain/entity/domain/dxid'
import { BaseOperation } from '@shared/utils/base-operation'
import { invertObj } from 'ramda'
import * as errors from '../../../errors'
import * as client from '../../../platform-client'
import { DxIdInput, UserOpsCtx } from '../../../types'
import { DbCluster } from '../db-cluster.entity'
import { STATUS, STATUSES } from '../db-cluster.enum'
import { STATIC_SCOPE } from '@shared/enums'
import { User } from '@shared/domain/user/user.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'

// TODO PFDA-5995: Jarda - get rid of operation, move it to DbCluster service
export class TerminateDbClusterOperation extends BaseOperation<UserOpsCtx, DxIdInput, DbCluster> {
  constructor(
    inputCtx: UserOpsCtx,
    private readonly userClient: client.PlatformClient,
    private readonly adminClient: client.PlatformClient,
  ) {
    super(inputCtx)
  }

  async run(input: DxIdInput): Promise<DbCluster> {
    const em = this.ctx.em
    const dbCluster = await em.findOne(DbCluster, { dxid: input.dxid as DxId<'dbcluster'> })

    if (!dbCluster) {
      throw new errors.DbClusterNotFoundError(`Db Cluster ${input.dxid} is not found`)
    }

    if (dbCluster.status !== STATUS.AVAILABLE) {
      throw new errors.DbClusterStatusMismatchError(
        'Terminate action can only be called when the dbcluster is in the "available" status',
        { details: { dxid: dbCluster.dxid, status: dbCluster.status } },
      )
    }

    let platformClient = this.userClient
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
          'User cannot terminate DbCluster - Insufficient privileges.',
        )

        throw new errors.PermissionError('Unable to terminate DbCluster in selected context.', {
          statusCode: 401,
        })
      }

      if (space.type === SPACE_TYPE.GROUPS || space.type === SPACE_TYPE.REVIEW) {
        platformClient = this.adminClient
      }
    }

    const apiResult = await platformClient.dbClusterAction(
      {
        dxid: dbCluster.dxid,
      },
      'terminate',
    )

    this.ctx.log.log(
      { id: dbCluster.id, dxid: dbCluster.dxid, apiResult },
      'Run terminate action for DB Cluster',
    )

    const describeResult = await this.userClient.dbClusterDescribe({
      dxid: dbCluster.dxid,
      project: dbCluster.project,
    })

    // @ts-ignore
    dbCluster.status = STATUS[invertObj(STATUSES)[describeResult.status]]
    await em.fork().persistAndFlush(dbCluster)

    return dbCluster
  }
}
