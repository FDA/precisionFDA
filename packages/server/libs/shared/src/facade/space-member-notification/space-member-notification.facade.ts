import { Injectable } from '@nestjs/common'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'

@Injectable()
export class SpaceMemberNotificationFacade {
  constructor(
    private readonly userContext: UserContext,
    private readonly spaceService: SpaceService,
    private readonly notificationService: NotificationService,
  ) {}

  async notifyNewDiscussionReply(spaceId: number, type: DISCUSSION_REPLY_TYPE, replyUrl: string): Promise<void> {
    const spaceMemberships = await this.spaceService.getSpaceMembers(spaceId)
    const notifiedUsers = spaceMemberships
      .map(membership => membership.user.id)
      .filter(id => id !== this.userContext.id)

    for (const userId of notifiedUsers) {
      await this.notificationService.createNotification({
        message: `A new reply has been added`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.DISCUSSION_REPLY_ADDED,
        userId: userId,
        meta: {
          linkTitle: `View ${type}`,
          linkUrl: replyUrl,
        },
        sessionId: null,
      })
    }
  }
}
