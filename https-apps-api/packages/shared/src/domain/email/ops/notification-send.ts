import { SpaceEvent } from '../../space-event'
import { SPACE_EVENT_ACTIVITY_TYPE } from '../../space-event/space-event.enum'
import { EmailProcessInput, EMAIL_TYPES } from '../email.config'
import { email } from '../..'
import { UserOpsCtx } from '../../../types'
import { BaseOperation } from '../../../utils'

const CONTENT_TYPES = [SPACE_EVENT_ACTIVITY_TYPE.file_added,
  SPACE_EVENT_ACTIVITY_TYPE.note_added,
  SPACE_EVENT_ACTIVITY_TYPE.app_added,
  SPACE_EVENT_ACTIVITY_TYPE.job_added,
  SPACE_EVENT_ACTIVITY_TYPE.asset_added,
  SPACE_EVENT_ACTIVITY_TYPE.comparison_added,
  SPACE_EVENT_ACTIVITY_TYPE.workflow_added,
  SPACE_EVENT_ACTIVITY_TYPE.file_deleted,
  SPACE_EVENT_ACTIVITY_TYPE.asset_deleted]
const COMMENT_TYPES = [SPACE_EVENT_ACTIVITY_TYPE.comment_added]
const MEMBERSHIP_TYPES = [SPACE_EVENT_ACTIVITY_TYPE.membership_added,
  SPACE_EVENT_ACTIVITY_TYPE.membership_disabled,
  SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
  SPACE_EVENT_ACTIVITY_TYPE.membership_enabled]
const SPACE_TYPES = [SPACE_EVENT_ACTIVITY_TYPE.space_locked,
  SPACE_EVENT_ACTIVITY_TYPE.space_unlocked,
  SPACE_EVENT_ACTIVITY_TYPE.space_deleted]

class NotificationSendOperation extends BaseOperation<UserOpsCtx, SpaceEvent, void> {
  async run(event: SpaceEvent) {
    const op = new email.EmailProcessOperation(this.ctx)

    if (CONTENT_TYPES.includes(event.activityType)) {
      const input: EmailProcessInput = {
        emailTypeId: EMAIL_TYPES.newContentAdded,
        input: { spaceEventId: event.id },
        receiverUserIds: [],
      }
      await op.execute(input)
    } else if (COMMENT_TYPES.includes(event.activityType)) {
      const input: EmailProcessInput = {
        emailTypeId: EMAIL_TYPES.commentAdded,
        input: { spaceEventId: event.id },
        receiverUserIds: [],
      }
      await op.execute(input)
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
      await op.execute(input)
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
      await op.execute(input)
    }
  }
}

export { NotificationSendOperation }
