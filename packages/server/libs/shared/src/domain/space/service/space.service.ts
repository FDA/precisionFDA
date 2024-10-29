import { Inject, Injectable } from '@nestjs/common'
import { SpaceCreationProcess } from '@shared/domain/space/create/space-creation.process'
import { CreateSpaceDto } from '@shared/domain/space/dto/create-space.dto'
import { SPACE_TYPE_TO_PROCESS_PROVIDER_MAP } from '@shared/domain/space/create/space-type-to-process-map.provider'
import { PermissionError, ServiceError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Logger } from 'nestjs-pino'
import { SPACE_STATE, SPACE_TYPE } from '../space.enum'
import { Node } from '@shared/domain/user-file/node.entity'
import { SpaceRepository } from '@shared/domain/space/space.repository'

@Injectable()
export class SpaceService {
  @ServiceLogger()
  protected readonly logger: Logger

  constructor(
    @Inject(SPACE_TYPE_TO_PROCESS_PROVIDER_MAP)
    private readonly spaceTypeToCreatorProviderMap: {
      [T in SPACE_TYPE]: SpaceCreationProcess
    },
    private readonly spaceRepository: SpaceRepository,
  ) {}

  async create(space: CreateSpaceDto): Promise<number> {
    this.logger.log(`Creating new ${SPACE_TYPE[space.spaceType]} space`)

    // REVIEW spaces not supported yet
    if ([SPACE_TYPE.REVIEW].includes(space.spaceType)) {
      throw new ServiceError(
        `Creation of ${SPACE_TYPE[space.spaceType]} space is not available yet.`,
      )
    }
    const process = this.spaceTypeToCreatorProviderMap[space.spaceType]
    return await process.build(space)
  }

  async validateVerificationSpace(node: Node) {
    if (!node.isInSpace()) {
      return
    }
    const space = await this.spaceRepository.findOne(node.getSpaceId())
    if (space.type === SPACE_TYPE.VERIFICATION && space.state === SPACE_STATE.LOCKED) {
      throw new PermissionError(
        `You have no permissions to remove ${node.name} as` +
          ' it is part of Locked Verification space.',
      )
    }
  }
}
