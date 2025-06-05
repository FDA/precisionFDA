import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable } from '@nestjs/common'
import { SpaceCreationProcess } from '@shared/domain/space/create/space-creation.process'
import { SPACE_TYPE_TO_PROCESS_PROVIDER_MAP } from '@shared/domain/space/create/space-type-to-process-map.provider'
import {
  NotFoundError,
  PermissionError,
  SpaceNotFoundError,
  UserNotFoundError,
} from '@shared/errors'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { Node } from '@shared/domain/user-file/node.entity'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Logger } from 'nestjs-pino'
import { SPACE_STATE, SPACE_TYPE } from '../space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { spaceActionPolicy } from '@shared/domain/space/space.action-policy'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import {
  ENTITY_TYPE,
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '@shared/domain/space-event/space-event.enum'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { Space } from '@shared/domain/space/space.entity'
import { CreateSpaceDTO } from '@shared/domain/space/dto/create-space.dto'
import { UpdateSpaceDTO } from '@shared/domain/space/dto/update-space.dto'
import { User } from '@shared/domain/user/user.entity'

@Injectable()
export class SpaceService {
  @ServiceLogger()
  protected readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userContext: UserContext,

    @Inject(SPACE_TYPE_TO_PROCESS_PROVIDER_MAP)
    private readonly spaceTypeToCreatorProviderMap: {
      [T in SPACE_TYPE]: SpaceCreationProcess
    },
    private readonly spaceRepository: SpaceRepository,
    private readonly spaceMembershipRepository: SpaceMembershipRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private async validateUpdate(currentUser: User, spaceInput: UpdateSpaceDTO, space: Space) {
    const hostLead = await space.findHostLead()
    const guestLead = await space.findGuestLead()
    const isSiteAdmin = await currentUser.isSiteAdmin()
    const isHostLead = this.userContext.dxuser === hostLead?.dxuser
    const isLead = isHostLead || this.userContext.dxuser === guestLead?.dxuser

    if (space.type === SPACE_TYPE.REVIEW && !isLead) {
      throw new PermissionError('Review space can be updated only by Reviewer or Sponsor leads.')
    }
    if (space.type === SPACE_TYPE.GOVERNMENT && !isHostLead) {
      throw new PermissionError('Government space can be updated only by owner.')
    }
    if (
      [SPACE_TYPE.GROUPS, SPACE_TYPE.ADMINISTRATOR].includes(space.type) &&
      !(isSiteAdmin || isLead)
    ) {
      throw new PermissionError(
        'Group and Admin spaces can be updated only by Host or Guest leads.',
      )
    }
    if (space.type === SPACE_TYPE.PRIVATE_TYPE && !isHostLead) {
      throw new PermissionError('Private space can be updated only by owner.')
    }
  }

  async update(spaceId: number, spaceInput: UpdateSpaceDTO) {
    this.logger.log(`Editing space ${spaceInput.name}`)
    const user = await this.userRepository.findOne({ id: this.userContext.id })
    const space = await this.spaceRepository.findEditableOne({ id: spaceId })

    if (!space) {
      throw new NotFoundError("Space not found or you don't have the permission.")
    }

    await this.validateUpdate(user, spaceInput, space)

    await this.em.transactional(async () => {
      space.name = spaceInput.name
      space.description = spaceInput.description
      if (space.type === SPACE_TYPE.REVIEW) {
        space.meta.cts = spaceInput.cts
        await space.confidentialSpaces.loadItems()

        space.confidentialSpaces.getItems().forEach((cs) => {
          cs.name = spaceInput.name
          cs.description = spaceInput.description
        })
      }
    })

    return space
  }

  async create(space: CreateSpaceDTO): Promise<number> {
    this.logger.log(`Creating new ${SPACE_TYPE[space.spaceType]} space`)

    const process = this.spaceTypeToCreatorProviderMap[space.spaceType]
    return await process.build(space)
  }

  async lockSpace(spaceId: number) {
    const user = await this.userRepository.findOne(
      { id: this.userContext.id },
      { populate: ['adminMemberships', 'adminMemberships.adminGroup'] },
    )
    const space = await this.spaceRepository.findOne({ id: spaceId })
    const confidentialSpaces = await this.spaceRepository.find({ spaceId: spaceId })

    if (!space) {
      throw new SpaceNotFoundError()
    }
    if (!user) {
      throw new UserNotFoundError()
    }

    const canBeLockedByCurrentUser = await spaceActionPolicy.canLock(space, user)
    if (!canBeLockedByCurrentUser) {
      throw new PermissionError('Lock operation is not permitted.')
    }

    await this.em.transactional(async (tem) => {
      space.state = SPACE_STATE.LOCKED
      confidentialSpaces.forEach((cs) => {
        cs.state = SPACE_STATE.LOCKED
      })

      const membership = await this.spaceMembershipRepository.findOne({ spaces: spaceId })

      const spaceEvent = new SpaceEvent(user, space)
      spaceEvent.entityId = spaceId
      spaceEvent.entityType = ENTITY_TYPE.SPACE
      spaceEvent.activityType = SPACE_EVENT_ACTIVITY_TYPE.space_locked
      spaceEvent.objectType = SPACE_EVENT_OBJECT_TYPE.SPACE
      spaceEvent.side = membership?.side
      spaceEvent.role = membership?.role
      spaceEvent.data = JSON.stringify({ name: space.name })

      await tem.persistAndFlush(spaceEvent)
    })
  }

  async unlockSpace(spaceId: number) {
    const user = await this.userRepository.findOne(
      { id: this.userContext.id },
      { populate: ['adminMemberships', 'adminMemberships.adminGroup'] },
    )
    const space = await this.spaceRepository.findOne({ id: spaceId })
    const confidentialSpaces = await this.spaceRepository.find({ spaceId })

    if (!space) {
      throw new SpaceNotFoundError()
    }
    if (!user) {
      throw new UserNotFoundError()
    }

    const canBeUnlockedByCurrentUser = await spaceActionPolicy.canUnlock(space, user)
    if (!canBeUnlockedByCurrentUser) {
      throw new PermissionError('Unlock operation is not permitted.')
    }

    await this.em.transactional(async (tem) => {
      space.state = SPACE_STATE.ACTIVE
      confidentialSpaces.forEach((cs) => {
        cs.state = SPACE_STATE.ACTIVE
      })

      const membership = await this.spaceMembershipRepository.findOne({ spaces: spaceId })

      const spaceEvent = new SpaceEvent(user, space)
      spaceEvent.entityId = spaceId
      spaceEvent.entityType = ENTITY_TYPE.SPACE
      spaceEvent.activityType = SPACE_EVENT_ACTIVITY_TYPE.space_unlocked
      spaceEvent.objectType = SPACE_EVENT_OBJECT_TYPE.SPACE
      spaceEvent.side = membership?.side
      spaceEvent.role = membership?.role
      spaceEvent.data = JSON.stringify({ name: space.name })

      await tem.persistAndFlush(spaceEvent)
    })
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

  /**
   * Get spaces that can be selected by the user.
   * This includes the space itself and all its confidential spaces.
   * @param spaceId
   */
  async getSelectableSpaces(spaceId: number) {
    const space = await this.spaceRepository.findOneOrFail({ id: spaceId })

    // collect ids of confidential spaces + space id
    const confidentialSpaces = await this.spaceRepository.find({ spaceId: space.id })
    const spaceIds = confidentialSpaces.map((space) => space.id)
    spaceIds.push(space.id)

    return await this.spaceRepository.findSpacesByIdAndUser(spaceIds, this.userContext.id)
  }

  async updateSpacesHiddenForAdmin(spaceIds: number[], hidden: boolean): Promise<void> {
    await this.em.nativeUpdate(Space, { id: { $in: spaceIds } }, { hidden })
  }

  async getAccessibleSpace(spaceId: number): Promise<Space | null> {
    return this.spaceRepository.findAccessibleOne({ id: spaceId })
  }
}
