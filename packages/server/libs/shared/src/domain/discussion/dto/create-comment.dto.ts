import { IsString, MinLength, IsNumber, ValidateIf, Validate } from 'class-validator'
import { NotifyConstraint, NotifyType } from '@shared/domain/discussion/dto/notify.type'

export class CreateCommentDTO {
  @IsString()
  @MinLength(1)
  content: string

  @ValidateIf((obj) => !obj.answerId)
  @IsNumber()
  discussionId?: number

  @ValidateIf((obj) => !obj.discussionId)
  @IsNumber()
  answerId?: number

  @Validate(NotifyConstraint)
  notify: NotifyType = []
}
