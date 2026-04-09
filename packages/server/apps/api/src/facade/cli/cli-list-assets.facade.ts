import { FilterQuery } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { CliListAssetDTO } from '@shared/domain/cli/dto/cli-list-assets.dto'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { NodeService } from '@shared/domain/user-file/node.service'
import { STATIC_SCOPE } from '@shared/enums'
import { NotFoundError } from '@shared/errors'
import { EntityScope } from '@shared/types/common'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class CliListAssetsFacade {
  constructor(
    private readonly nodeService: NodeService,
    private readonly user: UserContext,
    private readonly spaceService: SpaceService,
  ) {}

  async listAssets(scope: EntityScope): Promise<CliListAssetDTO[]> {
    let where: FilterQuery<Asset>

    if (EntityScopeUtils.isSpaceScope(scope)) {
      const spaceId = EntityScopeUtils.getSpaceIdFromScope(scope)
      const space = await this.spaceService.getAccessibleById(spaceId)
      if (!space) {
        throw new NotFoundError(`Space ${spaceId} not found or not accessible`)
      }
      where = { scope }
    } else if (scope === STATIC_SCOPE.PUBLIC) {
      where = { scope: STATIC_SCOPE.PUBLIC }
    } else {
      const currentUser = await this.user.loadEntity()
      where = { user: currentUser.id, scope: STATIC_SCOPE.PRIVATE }
    }

    const assets = await this.nodeService.listAccessibleAssets(where, {
      populate: ['user', 'archiveEntries', 'properties', 'taggings.tag'] as const,
      orderBy: { createdAt: 'DESC' } as const,
    })

    return assets.map(asset => CliListAssetDTO.fromEntity(asset))
  }
}
