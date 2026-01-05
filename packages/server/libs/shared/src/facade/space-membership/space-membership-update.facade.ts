import { EntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import {
  ENTITY_TYPE,
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '@shared/domain/space-event/space-event.enum'
import { UpdateSpaceMembershipDTO } from '@shared/domain/space-membership/dto/update-space-membership.dto'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipPermission } from '@shared/domain/space-membership/space-membership.type'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ClientRequestError, InternalError, InvalidStateError } from '@shared/errors'
import { MaintenanceQueueJobProducer } from '@shared/queue/producer/maintenance-queue-job.producer'

@Injectable()
export class SpaceMembershipUpdateFacade {
  constructor(
    private readonly em: EntityManager,
    private readonly userContext: UserContext,
    private readonly spaceService: SpaceService,
    private readonly spaceMembershipService: SpaceMembershipService,
    private readonly maintenanceQueueJobProducer: MaintenanceQueueJobProducer,
    private readonly emailService: EmailService,
  ) {}

  async updatePermissions(
    spaceId: number,
    dto: UpdateSpaceMembershipDTO,
  ): Promise<SpaceMembership[]> {
    const sharedSpace = await this.spaceService.getSharedSpace(spaceId)
    if (typeof dto.enabled === 'boolean') {
      return await this.updateState(sharedSpace, dto.membershipIds, dto.enabled)
    } else if (dto.targetRole in SPACE_MEMBERSHIP_ROLE) {
      return await this.updateRole(sharedSpace, dto.membershipIds, dto.targetRole)
    }
    throw new InvalidStateError('No valid update action provided')
  }

  async updateState(
    space: Space,
    memberIds: number[],
    enabled: boolean,
  ): Promise<SpaceMembership[]> {
    const membership = await this.spaceMembershipService.getCurrentUserMembershipInSharedSpace(
      space.id,
    )
    if (!membership) {
      throw new InvalidStateError('Current user is not a member of the space or invalid space')
    }

    try {
      let activityType: SPACE_EVENT_ACTIVITY_TYPE
      let action: 'disable' | 'enable'
      const updatedMemberships = await this.em.transactional(async () => {
        if (enabled) {
          activityType = SPACE_EVENT_ACTIVITY_TYPE.membership_enabled
          action = 'enable'
        } else {
          activityType = SPACE_EVENT_ACTIVITY_TYPE.membership_disabled
          action = 'disable'
        }
        const updated = await this.spaceMembershipService.updatePermission(
          space,
          membership,
          memberIds,
          action,
        )

        await this.createSpaceEvents(updated, action, activityType)
        return updated
      })

      await this.sendUpdateEmail(
        updatedMemberships,
        space.id,
        SPACE_EVENT_ACTIVITY_TYPE[activityType],
        action,
      )
      return updatedMemberships
    } catch (error: unknown) {
      await this.maintenanceQueueJobProducer.createSyncSpaceMemberAccessTask(space.id, memberIds)
      if (error instanceof ClientRequestError) {
        throw new InternalError('Failed to update space membership')
      } else {
        throw error
      }
    }
  }

  async updateRole(
    space: Space,
    memberIds: number[],
    targetRole: SPACE_MEMBERSHIP_ROLE,
  ): Promise<SpaceMembership[]> {
    const membership = await this.spaceMembershipService.getCurrentUserMembershipInSharedSpace(
      space.id,
    )
    if (!membership) {
      throw new InvalidStateError('Current user is not a member of the space or invalid space')
    }

    try {
      const activityType = SPACE_EVENT_ACTIVITY_TYPE.membership_changed
      const updatedMemberships = await this.em.transactional(async () => {
        const updatedMemberships = await this.spaceMembershipService.updatePermission(
          space,
          membership,
          memberIds,
          targetRole as SPACE_MEMBERSHIP_ROLE,
        )

        await this.createSpaceEvents(updatedMemberships, targetRole, activityType)
        return updatedMemberships
      })

      await this.sendUpdateEmail(
        updatedMemberships,
        space.id,
        SPACE_EVENT_ACTIVITY_TYPE[activityType],
        SPACE_MEMBERSHIP_ROLE[targetRole],
      )
      return updatedMemberships
    } catch (error: unknown) {
      await this.maintenanceQueueJobProducer.createSyncSpaceMemberAccessTask(space.id, memberIds)
      if (targetRole === SPACE_MEMBERSHIP_ROLE.LEAD) {
        await this.maintenanceQueueJobProducer.createSyncSpaceLeadBillToTask(membership.id)
      }
      if (error instanceof ClientRequestError) {
        throw new InternalError('Failed to update space membership')
      } else {
        throw error
      }
    }
  }

  private async createSpaceEvents(
    memberships: SpaceMembership[],
    target: SpaceMembershipPermission,
    activityType: SPACE_EVENT_ACTIVITY_TYPE,
  ): Promise<void> {
    await this.em.populate(memberships, ['spaces'])
    for (const member of memberships) {
      const spaces = member.spaces.getItems()
      for (const space of spaces) {
        const spaceEvent = await this.createSpaceEventObj(space, member, target, activityType)
        this.em.persist(spaceEvent)
      }
    }
    await this.em.flush()
  }

  private async createSpaceEventObj(
    space: Space,
    membership: SpaceMembership,
    targetRole: SpaceMembershipPermission,
    activityType: SPACE_EVENT_ACTIVITY_TYPE,
  ): Promise<SpaceEvent> {
    const user = await this.userContext.loadEntity()
    const spaceEvent = new SpaceEvent(user, space)
    spaceEvent.entityId = membership.id
    spaceEvent.objectType = SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP
    spaceEvent.entityType = ENTITY_TYPE.SPACE_MEMBERSHIP
    spaceEvent.activityType = activityType
    spaceEvent.role = membership.role
    spaceEvent.side = membership.side
    spaceEvent.data = JSON.stringify({
      role: (SPACE_MEMBERSHIP_ROLE[targetRole] ?? targetRole).toLowerCase(),
      full_name: membership.user.getEntity().fullName,
    })
    return spaceEvent
  }

  private async sendUpdateEmail(
    updatedMemberships: SpaceMembership[],
    spaceId: number,
    activityType: string,
    role: string,
  ): Promise<void> {
    for (const updatedMembership of updatedMemberships) {
      await this.emailService.sendEmail({
        type: EMAIL_TYPES.memberChangedAddedRemoved,
        input: {
          initUserId: this.userContext.id,
          spaceId: spaceId,
          updatedMembershipId: updatedMembership.id,
          activityType: activityType,
          newMembershipRole: role,
        },
      })
    }
  }
}
