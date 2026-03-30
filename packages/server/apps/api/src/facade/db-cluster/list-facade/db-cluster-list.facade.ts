import { FilterQuery } from '@mikro-orm/core'
import { Injectable, Logger } from '@nestjs/common'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { DbClusterPaginationDTO } from '@shared/domain/db-cluster/dto/db-cluster-pagination.dto'
import { DbClusterDTO } from '@shared/domain/db-cluster/dto/db-cluster.dto'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { getIdFromScopeName } from '@shared/domain/space/space.helper'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import { PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { LicenseService } from '@shared/domain/license/license.service'

@Injectable()
export class DbClusterListFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly dbClusterService: DbClusterService,
    private readonly userContext: UserContext,
    private readonly spaceService: SpaceService,
    private readonly spaceMembershipService: SpaceMembershipService,
    private readonly licenseService: LicenseService,
  ) {}

  async listDbClusters(pagination: DbClusterPaginationDTO): Promise<PaginatedResult<DbClusterDTO>> {
    this.logger.log({ pagination: pagination, userId: this.userContext.id }, 'Listing DbClusters.')
    const where = this.dbClusterService.buildCommonFilters(pagination)
    const user = await this.userContext.loadEntity()

    if (pagination.scope === HOME_SCOPE.SPACES) {
      const spaces = await user.accessibleSpaces()
      const scopes = spaces.map((s) => {
        return `space-${s.id}`
      })
      where.scope = { $in: scopes as (RegExp | `space-${number}`)[] }
    } else if (pagination.scope === STATIC_SCOPE.PRIVATE) {
      where.scope = { $eq: 'private' }
      where.user = { $eq: this.userContext.id }
    } else {
      const spaceId = getIdFromScopeName(pagination.scope)

      const space = await this.spaceService.getAccessibleById(spaceId)
      if (!space) {
        this.logger.warn(
          { userId: user.id, space: spaceId, scope: pagination.scope },
          'User cannot get DbClusters in given space.',
        )
        throw new PermissionError('Unable to list DbClusters in selected context.', {
          statusCode: 403,
        })
      }

      where.scope = { $eq: pagination.scope }
    }
    this.logger.log(
      { userId: user.id, pagination: pagination, where: where },
      'Getting DbClusters for following query.',
    )
    return this.paginate(pagination, where)
  }

  private async paginate(
    pagination: DbClusterPaginationDTO,
    where: FilterQuery<DbCluster>,
  ): Promise<PaginatedResult<DbClusterDTO>> {
    const response = await this.dbClusterService.paginate(pagination, where)
    const licensesByDbClusterId = await this.licenseService.findLicenseRefsByLicenseableIds(
      'DbCluster',
      response.data.map((cluster) => cluster.id),
    )

    const dbclusters = await Promise.all(
      response.data.map(async (dbcluster) => {
        const fileLicense = licensesByDbClusterId.get(dbcluster.id)
        if (dbcluster.isInSpace()) {
          const membership = await this.spaceMembershipService.getCurrentMembership(
            dbcluster.getSpaceId(),
            this.userContext.id,
          )
          return DbClusterDTO.mapToDTO(dbcluster, null, membership, fileLicense)
        }
        return DbClusterDTO.mapToDTO(dbcluster, null, null, fileLicense)
      }),
    )
    return { ...response, data: dbclusters }
  }
}
