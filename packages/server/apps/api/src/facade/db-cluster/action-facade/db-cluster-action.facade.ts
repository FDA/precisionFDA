import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { invertObj } from 'ramda'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { ActionConfig, STATUS, STATUSES } from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { STATIC_SCOPE } from '@shared/enums'
import { DbClusterStatusMismatchError, NotFoundError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { DbClusterAction, PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'

@Injectable()
export class DbClusterActionFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly dbClusterService: DbClusterService,
    private readonly em: SqlEntityManager,
    private readonly userContext: UserContext,
    private readonly userClient: PlatformClient,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
    private readonly spaceService: SpaceService,
  ) {}

  private async executeDbClusterAction(dxid: DxId<'dbcluster'>, action: DbClusterAction): Promise<DbCluster> {
    this.logger.log({ dxid }, `${action.charAt(0).toUpperCase() + action.slice(1)}ing DbCluster.`)
    const dbCluster = await this.dbClusterService.getEditableByDxId(dxid)

    if (!dbCluster) {
      this.logger.warn(
        { userId: this.userContext.id, dbClusterDxId: dxid, action: action },
        `DbCluster does not exist or is not editable/accessible by user.`,
      )
      throw new NotFoundError('DbCluster not found or not accessible')
    }

    const config = this.actionConfigs[action]
    if (dbCluster.status !== config.requiredStatus) {
      this.logger.warn(
        { uid: dbCluster.uid },
        `Cannot ${action} DbCluster if it's not ${STATUSES[invertObj(STATUS)[config.requiredStatus]]}.`,
      )
      throw new DbClusterStatusMismatchError(config.errorMessage, {
        details: { uid: dbCluster.uid, status: dbCluster.status },
      })
    }

    let platformClient = this.userClient

    if (dbCluster.scope !== STATIC_SCOPE.PRIVATE) {
      const spaceId = dbCluster.getSpaceId()
      const space = await this.spaceService.getEditableById(spaceId)

      if (!space) {
        this.logger.warn(
          { userId: this.userContext.id, dbclusterId: dbCluster.id, space: space },
          `User cannot ${action} DbCluster - Insufficient privileges.`,
        )

        throw new PermissionError(`Unable to ${action} DbCluster in selected context.`, {
          statusCode: 403,
        })
      }

      if (space.type === SPACE_TYPE.GROUPS || space.type === SPACE_TYPE.REVIEW) {
        platformClient = this.adminClient
      }
    }

    const apiResult = await platformClient.dbClusterAction({ dxid: dbCluster.dxid }, action)

    this.logger.log(
      { id: dbCluster.id, dxid: dbCluster.dxid, apiResult },
      `${action.charAt(0).toUpperCase() + action.slice(1)} action response from platform.`,
    )

    const describeResult = await this.userClient.dbClusterDescribe({
      dxid: dbCluster.dxid,
      project: dbCluster.project,
    })

    this.logger.log(
      { id: dbCluster.id, dxid: dbCluster.dxid, describeResult },
      'Describe DbCluster response from platform.',
    )

    dbCluster.status = STATUS[invertObj(STATUSES)[describeResult.status]]
    await this.em.flush()

    return dbCluster
  }

  async startDbCluster(dxid: DxId<'dbcluster'>): Promise<DbCluster> {
    return this.executeDbClusterAction(dxid, 'start')
  }

  async stopDbCluster(dxid: DxId<'dbcluster'>): Promise<DbCluster> {
    return this.executeDbClusterAction(dxid, 'stop')
  }

  async terminateDbCluster(dxid: DxId<'dbcluster'>): Promise<DbCluster> {
    return this.executeDbClusterAction(dxid, 'terminate')
  }

  private readonly actionConfigs: Record<DbClusterAction, ActionConfig> = {
    start: {
      requiredStatus: STATUS.STOPPED,
      errorMessage: 'Start action can only be called when the DbCluster is in the "stopped" status.',
    },
    stop: {
      requiredStatus: STATUS.AVAILABLE,
      errorMessage: 'Stop action can only be called when the DbCluster is in the "available" status.',
    },
    terminate: {
      requiredStatus: STATUS.AVAILABLE,
      errorMessage: 'Terminate action can only be called when the DbCluster is in the "available" status.',
    },
  }
}
