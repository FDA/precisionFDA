import { FilterQuery, SqlEntityManager } from '@mikro-orm/mysql'
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
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SpacePaginationDTO } from '@shared/domain/space/dto/space-pagination.dto'
import { SpaceListItemDTO } from '@shared/domain/space/dto/space-list-item.dto'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { SpaceGroupService } from '@shared/domain/space/service/space-group.service'
import { SpaceGroupDTO } from '@shared/domain/space/dto/space-group.dto'
import { CreateSpaceGroupDTO } from '@shared/domain/space/dto/create-space-group.dto'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'

type SpaceFilter = FilterQuery<Space> & {
  spaceMemberships?: {
    user: number
    active: boolean
  }
  spaceGroups?: {
    id: number
  }
}

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
    private readonly spaceGroupService: SpaceGroupService,
  ) {}

  private async validateUpdate(currentUser: User, space: Space): Promise<void> {
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

  async update(spaceId: number, spaceInput: UpdateSpaceDTO): Promise<Space> {
    this.logger.log(`Editing space ${spaceInput.name}`)
    const user = await this.userRepository.findOne({ id: this.userContext.id })
    const space = await this.spaceRepository.findEditableOne({ id: spaceId })

    if (!space) {
      throw new NotFoundError("Space not found or you don't have the permission.")
    }

    await this.validateUpdate(user, space)

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

  async lockSpace(spaceId: number): Promise<void> {
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

  async unlockSpace(spaceId: number): Promise<void> {
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

  async validateVerificationSpace(node: Node): Promise<void> {
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
   * Determines if the current user can download files/data from a specific space.
   *
   * A user can download from a space if either:
   * 1. The space is not protected (protected = false) and user is active member, OR
   * 2. The space is protected but the user is an active LEAD member of that space
   *
   * @param spaceId - The unique identifier of the space to check download permissions for
   * @returns Promise<boolean> - True if the user has download permissions, false otherwise
   *
   **/
  async canUserDownloadFrom(spaceId: number): Promise<boolean> {
    const result = await this.spaceRepository.count({
      id: spaceId,
      $or: [
        { protected: false, spaceMemberships: { user: this.userContext.id, active: true } },
        {
          protected: true,
          spaceMemberships: {
            user: this.userContext.id,
            active: true,
            role: SPACE_MEMBERSHIP_ROLE.LEAD,
          },
        },
      ],
    })

    return result > 0
  }

  /**
   * Get spaces that can be selected by the user.
   * This includes the space itself and all its confidential spaces.
   * @param spaceId
   */
  async getSelectableSpaces(spaceId: number): Promise<Space[]> {
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

  async getEditableById(id: number): Promise<Space> {
    return await this.spaceRepository.findEditableOne({ id })
  }

  async getAccessibleById(id: number): Promise<Space> {
    return await this.spaceRepository.findAccessibleOne({ id })
  }

  async getAccessibleSpace(spaceId: number): Promise<Space | null> {
    return this.spaceRepository.findAccessibleOne({ id: spaceId })
  }

  async getSpaceMembers(spaceId: number): Promise<SpaceMembership[]> {
    const space = await this.spaceRepository.findAccessibleOne({
      id: spaceId,
    })

    if (!space) {
      throw new SpaceNotFoundError('Space does not exist or is not accessible')
    }

    return await this.spaceMembershipRepository.find(
      { spaces: spaceId },
      {
        orderBy: {
          side: 'ASC',
          role: 'ASC',
        },
      },
    )
  }

  // Any of the returned spaces cannot have state == DELETED
  // Regular user: All unhidden spaces they are active member
  // Site admin:   All the spaces they are active member of + all the group spaces
  // RSA:          All the spaces they are active member of + all the review spaces
  // RSA + SA:     All the spaces they are active member of + all the review spaces + all the group spaces
  async paginateSpaces(query: SpacePaginationDTO): Promise<PaginatedResult<SpaceListItemDTO>> {
    const filterWhere = this.buildFilterWhere(query)
    const accessWhere = await this.buildAccessWhere()

    return this.fetchAndMapSpaces(query, { $and: [filterWhere, accessWhere] })
  }

  // Any of the returned spaces cannot have state == DELETED
  // Every returned space is assigned to the space group
  // Regular user:      All unhidden spaces of the space group as long as they are active member of at least one of them
  // Site admin, RSA:   All unhidden spaces of the space group
  async paginateSpaceGroupSpaces(
    spaceGroupId: number,
    query: SpacePaginationDTO,
  ): Promise<PaginatedResult<SpaceListItemDTO>> {
    const isSiteAdmin = await (await this.userContext.loadEntity()).isSiteAdmin()
    const isReviewSpaceAdmin = await (await this.userContext.loadEntity()).isReviewSpaceAdmin()
    const filterWhere = this.buildFilterWhere(query)
    const accessWhere = this.buildSpaceGroupAccessWhere(
      spaceGroupId,
      isSiteAdmin || isReviewSpaceAdmin,
    )

    const result = await this.fetchAndMapSpaces(query, { $and: [filterWhere, accessWhere] })

    const hasMembership = result.data.some((space) => !!space.currentUserMembership)

    if (hasMembership || isSiteAdmin || isReviewSpaceAdmin) {
      return result
    }

    throw new PermissionError('You do not have a permission to list spaces of this space group.')
  }

  async getSpaceGroupById(id: number): Promise<SpaceGroupDTO> {
    return this.spaceGroupService.getById(id)
  }

  async listSpaceGroups(): Promise<SpaceGroupDTO[]> {
    return this.spaceGroupService.list()
  }

  async createSpaceGroup(spaceGroupDto: CreateSpaceGroupDTO): Promise<number> {
    return this.spaceGroupService.create(spaceGroupDto)
  }

  async updateSpaceGroup(
    spaceGroupId: number,
    spaceGroupInput: CreateSpaceGroupDTO,
  ): Promise<void> {
    return this.spaceGroupService.update(spaceGroupId, spaceGroupInput)
  }

  async deleteSpaceGroup(spaceGroupId: number): Promise<void> {
    return this.spaceGroupService.delete(spaceGroupId)
  }

  async addSpacesIntoSpaceGroup(spaceGroupId: number, spaceIds: number[]): Promise<void> {
    return this.spaceGroupService.addSpaces(spaceGroupId, spaceIds)
  }

  async removeSpacesFromSpaceGroup(spaceGroupId: number, spaceIds: number[]): Promise<void> {
    return this.spaceGroupService.removeSpaces(spaceGroupId, spaceIds)
  }

  private async buildAccessWhere(): Promise<FilterQuery<Space>> {
    const isSiteAdmin = await (await this.userContext.loadEntity()).isSiteAdmin()
    const isReviewSpaceAdmin = await (await this.userContext.loadEntity()).isReviewSpaceAdmin()
    const filters: FilterQuery<Space>[] = [
      {
        spaceMemberships: {
          user: this.userContext.id,
          active: true,
        },
        $or: [{ type: SPACE_TYPE.REVIEW, spaceId: null }, { type: { $ne: SPACE_TYPE.REVIEW } }],
        state: { $ne: SPACE_STATE.DELETED },
      },
    ]

    const hiddenFilter = isSiteAdmin || isReviewSpaceAdmin ? {} : { hidden: false }

    if (isSiteAdmin) {
      filters.push(this.siteAdminFilter())
    }

    if (isReviewSpaceAdmin) {
      filters.push(this.rsaFilter())
    }

    return { $and: [hiddenFilter, { $or: [filters] }] }
  }

  private buildSpaceGroupAccessWhere(spaceGroupId: number, isAdmin: boolean): FilterQuery<Space> {
    const filter: FilterQuery<Space> = {
      $or: [{ type: SPACE_TYPE.REVIEW, spaceId: null }, { type: { $ne: SPACE_TYPE.REVIEW } }],
      spaceGroups: { id: spaceGroupId },
      state: { $ne: SPACE_STATE.DELETED },
    }

    if (!isAdmin) {
      filter.hidden = false
    }

    return filter
  }

  private rsaFilter(): FilterQuery<Space> {
    return {
      state: { $ne: SPACE_STATE.DELETED },
      type: SPACE_TYPE.REVIEW,
      spaceId: null,
    }
  }

  private siteAdminFilter(): FilterQuery<Space> {
    return {
      state: { $ne: SPACE_STATE.DELETED },
      type: SPACE_TYPE.GROUPS,
    }
  }

  private buildFilterWhere(query: SpacePaginationDTO): SpaceFilter {
    const where: SpaceFilter = {}

    if (query.filter?.id) {
      where.id = { $like: `%${query.filter.id}%` }
    }
    if (query.filter?.hidden !== undefined) {
      where.hidden = query.filter?.hidden
    }
    if (query.filter?.name) {
      where.name = { $like: `%${query.filter.name}%` }
    }
    if (query.filter?.state !== undefined) {
      where.state = query.filter.state
    }
    if (query.filter?.type !== undefined) {
      where.type = query.filter.type
    }
    if (query.filter?.tags !== undefined) {
      const cleanedTags = query.filter.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const likeConditions = cleanedTags.map((tag) => ({ name: { $like: `%${tag}%` } }))
      where.taggings = { tag: { $or: likeConditions } }
    }

    return where
  }

  private async fetchAndMapSpaces(
    query: SpacePaginationDTO,
    where: FilterQuery<Space>,
  ): Promise<PaginatedResult<SpaceListItemDTO>> {
    const spaces = await this.spaceRepository.paginate(query, where, {
      populate: [], // Do not populate deep relations here
    })

    // Now populate relations separately (efficiently, one-by-one)
    await this.spaceRepository.populate(spaces.data, ['spaceMemberships.user', 'taggings.tag'])

    return {
      meta: spaces.meta,
      data: await Promise.all(
        spaces.data.map((space) => SpaceListItemDTO.fromEntity(space, this.userContext.id)),
      ),
    }
  }
}
