import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable } from '@nestjs/common'
import { SpaceCreationProcess } from '@shared/domain/space/create/space-creation.process'
import { CreateSpaceDto } from '@shared/domain/space/dto/create-space.dto'
import { SPACE_TYPE_TO_PROCESS_PROVIDER_MAP } from '@shared/domain/space/create/space-type-to-process-map.provider'
import { ServiceError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Logger } from 'nestjs-pino'
import { SPACE_TYPE } from '../space.enum'


@Injectable()
export class SpaceService {

  @ServiceLogger()
  protected readonly logger: Logger

  constructor(
    @Inject(SPACE_TYPE_TO_PROCESS_PROVIDER_MAP)
    private readonly spaceTypeToCreatorProviderMap: {
      [T in SPACE_TYPE]: SpaceCreationProcess
    },
    private readonly em: SqlEntityManager) {
  }

  async create(space: CreateSpaceDto): Promise<number> {
    this.logger.log(`Creating new ${SPACE_TYPE[space.spaceType]} space`)

    // REVIEW spaces not supported yet
    if ([SPACE_TYPE.REVIEW].includes(space.spaceType)) {
      throw new ServiceError(`Creation of ${SPACE_TYPE[space.spaceType]} space is not available yet.`)
    }
    const process = this.spaceTypeToCreatorProviderMap[space.spaceType]
    return await process.build(space)
  }

}
