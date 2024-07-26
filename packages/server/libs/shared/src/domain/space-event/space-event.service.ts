import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { getEntityType, getObjectType, getSpaceEventJsonData } from '@shared/utils/object-utils'
import { SpaceEventInput } from '@shared/domain/space-event/space-event.input'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { EMAIL_TYPES, EmailProcessInput } from '@shared/domain/email/email.config'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { EmailFacade } from '@shared/domain/email/email.facade'

const CONTENT_TYPES = [
  SPACE_EVENT_ACTIVITY_TYPE.file_added,
  SPACE_EVENT_ACTIVITY_TYPE.note_added,
  SPACE_EVENT_ACTIVITY_TYPE.app_added,
  SPACE_EVENT_ACTIVITY_TYPE.job_added,
  SPACE_EVENT_ACTIVITY_TYPE.asset_added,
  SPACE_EVENT_ACTIVITY_TYPE.comparison_added,
  SPACE_EVENT_ACTIVITY_TYPE.workflow_added,
  SPACE_EVENT_ACTIVITY_TYPE.file_deleted,
  SPACE_EVENT_ACTIVITY_TYPE.asset_deleted,
]
const COMMENT_TYPES = [SPACE_EVENT_ACTIVITY_TYPE.comment_added]
const MEMBERSHIP_TYPES = [
  SPACE_EVENT_ACTIVITY_TYPE.membership_added,
  SPACE_EVENT_ACTIVITY_TYPE.membership_disabled,
  SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
  SPACE_EVENT_ACTIVITY_TYPE.membership_enabled,
]
const SPACE_TYPES = [
  SPACE_EVENT_ACTIVITY_TYPE.space_locked,
  SPACE_EVENT_ACTIVITY_TYPE.space_unlocked,
  SPACE_EVENT_ACTIVITY_TYPE.space_deleted,
]

@Injectable()
export class SpaceEventService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly user: UserContext,
    private readonly em: SqlEntityManager,
    private readonly spaceRepo: SpaceRepository,
    private readonly userRepo: UserRepository,
    private readonly spaceMembershipRepo: SpaceMembershipRepository,
    private readonly emailFacade: EmailFacade,
  ) {}

  async createSpaceEvent(input: SpaceEventInput): Promise<SpaceEvent | undefined> {
    this.logger.log('Creating space event', input)
    const membership = input.membership
      ? input.membership
      : await this.spaceMembershipRepo.getMembership(input.spaceId, input.userId)

    const space = await this.spaceRepo.findOne(input.spaceId)
    const user = await this.userRepo.findOne(this.user.id)

    if (space !== null && user !== null) {
      const spaceEvent = new SpaceEvent(user, space)
      spaceEvent.activityType = input.activityType
      spaceEvent.side = membership.side
      spaceEvent.role = membership.role
      spaceEvent.entityId = input.entity.value.id
      spaceEvent.entityType = getEntityType(input.entity)
      spaceEvent.objectType = getObjectType(input.entity)

      const objectData = getSpaceEventJsonData(input.entity)
      spaceEvent.data = objectData || undefined

      await this.em.persistAndFlush(spaceEvent)

      return spaceEvent
    }
  }

  async sendNotificationForEvent(event: SpaceEvent) {
    this.logger.log(
      `Sending notification for space event id: ${event.id} activityType: ${event.activityType}`,
    )
    if (CONTENT_TYPES.includes(event.activityType)) {
      const input: EmailProcessInput = {
        emailTypeId: EMAIL_TYPES.newContentAdded,
        input: { spaceEventId: event.id },
        receiverUserIds: [],
      }
      await this.emailFacade.sendEmail(input)
    } else if (COMMENT_TYPES.includes(event.activityType)) {
      const input: EmailProcessInput = {
        emailTypeId: EMAIL_TYPES.commentAdded,
        input: { spaceEventId: event.id },
        receiverUserIds: [],
      }
      await this.emailFacade.sendEmail(input)
    } else if (SPACE_TYPES.includes(event.activityType)) {
      const input: EmailProcessInput = {
        emailTypeId: EMAIL_TYPES.spaceChanged,
        input: {
          initUserId: event.user.id,
          spaceId: event.space.id,
          activityType: event.activityType,
        },
        receiverUserIds: [],
      }
      await this.emailFacade.sendEmail(input)
    } else if (MEMBERSHIP_TYPES.includes(event.activityType)) {
      const input: EmailProcessInput = {
        emailTypeId: EMAIL_TYPES.memberChangedAddedRemoved,
        input: {
          initUserId: event.user.id,
          spaceId: event.space.id,
          updatedMembershipId: event.entityId,
          activityType: event.activityType,
          newMembershipRole: event.role,
        },
        receiverUserIds: [],
      }
      await this.emailFacade.sendEmail(input)
    }
  }
}
