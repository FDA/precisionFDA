import { IsInt, Min, Validate } from 'class-validator'
import { NotifyConstraint, NotifyType } from '@shared/domain/discussion/dto/notify.type'

export class DiscussionNotificationDTO {
  @IsInt()
  @Min(1)
  discussionId: number

  @Validate(NotifyConstraint)
  notify: NotifyType
}
