import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { NotifyConstraint, NotifyType } from '@shared/domain/discussion/dto/notify.type'
import { Type } from 'class-transformer'
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator'
import { AttachmentsDTO } from './attachments.dto'

export class CreateReplyDTO {
  @IsString()
  @MinLength(1)
  title: string

  @IsString()
  @MinLength(1)
  content: string

  @ValidateNested()
  @Type(() => AttachmentsDTO)
  attachments: AttachmentsDTO = new AttachmentsDTO()

  @IsNotEmpty()
  @IsEnum(DISCUSSION_REPLY_TYPE)
  type: DISCUSSION_REPLY_TYPE

  @IsNumber()
  @IsOptional()
  parentId?: number

  @Validate(NotifyConstraint)
  notify: NotifyType = []
}
