import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'
import { ResourceRepository } from '@shared/domain/resource/resource.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NotFoundError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class ResourceService {

  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly resourceRepo: ResourceRepository,
    private readonly user: UserContext,
  ) {}

  async getDownloadUrl(fileUid: string) {
    const resources = await this.resourceRepo.findResourcesByFileUid(fileUid)

    if (resources.length == 0) {
      this.logger.error(`Resource not found for fileUid: ${fileUid}`)
      throw new NotFoundError(`Resource for ${fileUid} not found`)
    }
    const resource = resources[0]

    const portal = await this.em.findOne(DataPortal, {
      id: resource.dataPortal.id,
      space: {
        spaceMemberships: {
          user: this.user.id,
          active: true,
        },
      },
    })
    if (!portal) {
      this.logger.error(`User is not a member of the portal (id:${resource.dataPortal.id}) for resource: ${resource.id}`)
      throw new PermissionError('User is not a member of the portal')
    }
    return resource.url
  }


}
