import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { ResourceService } from '@shared/domain/resource/service/resource.service'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import { RemoveNodesFacade } from '../node-remove/remove-nodes.facade'

@Injectable()
export class DataPortalResourceRemoveFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userFileService: UserFileService,
    private readonly resourceService: ResourceService,
    private readonly dataPortalService: DataPortalService,
    private readonly removeNodesFacade: RemoveNodesFacade,
  ) {}

  async remove(id: number, portalSlug: string): Promise<void> {
    this.logger.log(`Removing resource: ${id}`)

    // portal already validated in getByUrlSlugOrId
    const portal = await this.dataPortalService.getByUrlSlugOrId(portalSlug)

    const file = await this.userFileService.findEditableOne({
      resource: id,
      scope: EntityScopeUtils.getScopeFromSpaceId(portal.spaceId),
    })
    if (!file) {
      throw new NotFoundError(`Resource ${id} not found in data portal: ${portalSlug}`)
    }

    this.logger.log(
      `Deleting resource with id: ${file.resource.id}, userFile.uid: ${file.uid}, dataPortal: ${portalSlug}`,
    )
    await this.removeResourceInDB(file.resource.id, file.id)
  }

  private async removeResourceInDB(resourceId: number, fileId: number): Promise<void> {
    await this.em.transactional(async () => {
      await this.resourceService.removeById(resourceId)
      await this.removeNodesFacade.removeNodes([fileId])
    })
  }
}
