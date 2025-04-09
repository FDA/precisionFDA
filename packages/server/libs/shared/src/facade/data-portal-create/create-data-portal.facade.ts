import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { CreateDataPortalDTO } from '@shared/domain/data-portal/dto/CreateDataPortalDTO'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { CreateSpaceDTO } from '@shared/domain/space/dto/create-space.dto'

@Injectable()
export class CreateDataPortalFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly spacesService: SpaceService,
    private readonly dataPortalService: DataPortalService,
  ) {}

  /**
   * Creates new data portal.
   */
  async create(body: CreateDataPortalDTO) {
    this.logger.log(`Creating data portal ${body.name}`)
    return await this.em.transactional(async () => {
      const createSpaceDto = new CreateSpaceDTO()
      createSpaceDto.name = body.name
      createSpaceDto.description = body.description
      createSpaceDto.spaceType = SPACE_TYPE.GROUPS
      createSpaceDto.hostLeadDxuser = body.hostLeadDxUser
      createSpaceDto.guestLeadDxuser = body.guestLeadDxUser
      const spaceId = await this.spacesService.create(createSpaceDto)

      return await this.dataPortalService.create(body, spaceId)
    })
  }
}
