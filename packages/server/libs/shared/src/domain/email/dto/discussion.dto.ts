import { NotifyConstraint, NotifyType } from '@shared/domain/discussion/dto/notify.type'
import { IsInt, Min, Validate } from 'class-validator'

export class DiscussionDTO {
  @IsInt()
  @Min(1)
  discussionId: number

  @Validate(NotifyConstraint)
  notify: NotifyType
}
