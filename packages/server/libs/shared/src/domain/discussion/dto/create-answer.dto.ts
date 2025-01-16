import { IsString, ValidateNested, MinLength, IsNumber, Validate } from 'class-validator'
import { Type } from 'class-transformer'
import { AttachmentsDTO } from './attachments.dto'
import { NotifyConstraint, NotifyType } from '@shared/domain/discussion/dto/notify.type'

export class CreateAnswerDTO {
  @IsNumber()
  discussionId: number

  @IsString()
  @MinLength(1)
  title: string

  @IsString()
  @MinLength(1)
  content: string

  @ValidateNested()
  @Type(() => AttachmentsDTO)
  attachments: AttachmentsDTO = new AttachmentsDTO()

  @Validate(NotifyConstraint)
  notify: NotifyType = []
}
