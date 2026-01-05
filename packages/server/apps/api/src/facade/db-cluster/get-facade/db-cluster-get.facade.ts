import { Injectable, Logger } from '@nestjs/common'
import { DbClusterDTO } from '@shared/domain/db-cluster/dto/db-cluster.dto'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { Uid } from '@shared/domain/entity/domain/uid'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { getIdFromScopeName } from '@shared/domain/space/space.helper'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NotFoundError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class DbClusterGetFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly dbClusterService: DbClusterService,
    private readonly userContext: UserContext,
    private readonly spaceService: SpaceService,
    private readonly spaceMembershipService: SpaceMembershipService,
  ) {}

  async getDbCluster(uid: Uid<'dbcluster'>): Promise<DbClusterDTO> {
    this.logger.log({ uid: uid, userId: this.userContext.id }, 'Getting DbCluster data.')
    const dbCluster = await this.dbClusterService.getAccessibleByUid(uid, {
      populate: ['user', 'properties', 'taggings.tag'],
    })
    if (!dbCluster) {
      this.logger.warn(
        { userId: this.userContext.id, dbClusterUid: uid },
        `DbCluster does not exist or is not accessible by user.`,
      )
      throw new NotFoundError('DbCluster not found or not accessible')
    }

    if (dbCluster.isPrivate()) {
      return DbClusterDTO.mapToDTO(dbCluster)
    }

    const spaceId = getIdFromScopeName(dbCluster.scope)
    const space = await this.spaceService.getAccessibleById(spaceId)
    if (!space) {
      this.logger.warn(
        { userId: this.userContext.id, spaceId: spaceId, dbClusterUid: uid },
        'Space is not accessible by the user.',
      )
      throw new PermissionError('Unable to get DbCluster in selected context.', {
        statusCode: 403,
      })
    }

    const membership = await this.spaceMembershipService.getCurrentMembership(
      spaceId,
      this.userContext.id,
    )

    return DbClusterDTO.mapToDTO(dbCluster, space, membership)
  }
}
