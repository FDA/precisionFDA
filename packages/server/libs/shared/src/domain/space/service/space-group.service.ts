import { wrap } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { Logger } from 'nestjs-pino'
import { CreateSpaceGroupDTO } from '@shared/domain/space/dto/create-space-group.dto'
import { SpaceGroupDTO } from '@shared/domain/space/dto/space-group.dto'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SpaceGroup } from '@shared/domain/space/space-group.entity'
import { SpaceGroupRepository } from '@shared/domain/space/space-group.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { InvalidRequestError, NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class SpaceGroupService {
  @ServiceLogger()
  protected readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly spaceGroupRepo: SpaceGroupRepository,
    private readonly spaceRepo: SpaceRepository,
  ) {}

  // Any site admin or space admin can create a space group
  async create(spaceGroupDto: CreateSpaceGroupDTO): Promise<number> {
    this.logger.log(`Creating new space group`)

    const spaceGroup = this.spaceGroupRepo.create({
      name: spaceGroupDto.name,
      description: spaceGroupDto.description,
    })
    await this.em.persistAndFlush(spaceGroup)

    return spaceGroup.id
  }

  // Any site admin or space admin can edit any space group
  async update(spaceGroupId: number, spaceGroupInput: CreateSpaceGroupDTO): Promise<void> {
    this.logger.log(`Editing space group ${spaceGroupId}`)
    const spaceGroup = await this.spaceGroupRepo.findEditableOne({ id: spaceGroupId })

    if (!spaceGroup) {
      throw new NotFoundError(`Space group ${spaceGroupId} not found`)
    }

    wrap(spaceGroup).assign(spaceGroupInput)
    await this.em.flush()
  }

  // Any site admin or space admin can delete any space group
  async delete(spaceGroupId: number): Promise<void> {
    this.logger.log(`Deleting space group ${spaceGroupId}`)

    const spaceGroup = await this.spaceGroupRepo.findEditableOne({ id: spaceGroupId })
    if (!spaceGroup) {
      throw new NotFoundError(`Space group ${spaceGroupId} not found`)
    }

    await this.spaceGroupRepo.removeAndFlush(spaceGroup)
  }

  // Any site admin or space admin can add any space (of types GROUPS, REVIEW, GOVERNMENT) to any space group
  async addSpaces(spaceGroupId: number, spaceIds: number[]): Promise<void> {
    if (!spaceIds || spaceIds.length === 0) {
      throw new InvalidRequestError(`No spaces specified`)
    }
    const uniqueSpaceIds = [...new Set(spaceIds)]

    const spaceGroup = await this.spaceGroupRepo.findEditableOne({ id: spaceGroupId }, { populate: ['spaces'] })
    if (!spaceGroup) {
      throw new NotFoundError(`Space group ${spaceGroupId} not found`)
    }

    const spaces = await this.spaceRepo.find({ id: { $in: uniqueSpaceIds } })
    if (!spaces || spaces.length !== uniqueSpaceIds.length) {
      throw new NotFoundError(`Some of the selected spaces were not found`)
    }

    const invalidSpaceType = !!spaces.find(
      space => ![SPACE_TYPE.GROUPS, SPACE_TYPE.REVIEW, SPACE_TYPE.GOVERNMENT].includes(space.type),
    )

    if (invalidSpaceType) {
      throw new InvalidRequestError('Only group, review and government spaces can be added to a space group')
    }

    spaceGroup.spaces.add(spaces)
    await this.em.flush()
  }

  // Any site admin or space admin can remove any space from any space group
  async removeSpaces(spaceGroupId: number, spaceIds: number[]): Promise<void> {
    const spaceGroup = await this.spaceGroupRepo.findEditableOne({ id: spaceGroupId }, { populate: ['spaces'] })
    if (!spaceGroup) {
      throw new NotFoundError(`Space group ${spaceGroupId} not found`)
    }

    const spaces = await this.spaceRepo.find({ id: { $in: spaceIds } })
    if (!spaces || !spaces.length) {
      throw new NotFoundError(`None of the spaces was found`)
    }

    spaceGroup.spaces.remove(spaces)
    await this.em.flush()
  }

  async getById(id: number): Promise<SpaceGroupDTO> {
    this.logger.log('Getting space group for user', id, this.user.id)
    const spaceGroup = await this.spaceGroupRepo.findAccessibleOne(
      { id: id },
      { populate: ['spaces.spaceMemberships.user'] },
    )

    if (spaceGroup) {
      return SpaceGroupDTO.fromEntity(spaceGroup, this.user.id)
    }

    throw new NotFoundError(`Space group with id ${id} was not found`)
  }

  /**
   * Returns all the space groups where current user has membership in at least one of their spaces
   * or all space groups (regardless of membership) in case the user is a site admin or space admin
   */
  async list(): Promise<SpaceGroupDTO[]> {
    this.logger.log('Getting space groups for user', this.user.id)
    const spaceGroups = await this.spaceGroupRepo.findAccessible(
      {},
      {
        populate: ['spaces.spaceMemberships.user'],
        orderBy: { name: 'asc' },
      },
    )

    return spaceGroups.map((spaceGroup: SpaceGroup) => SpaceGroupDTO.fromEntity(spaceGroup, this.user.id))
  }
}
