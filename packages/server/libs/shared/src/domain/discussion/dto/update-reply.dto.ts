import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator'
import { AttachmentsDTO } from './attachments.dto'

export class UpdateReplyDTO {
  @IsString()
  @MinLength(1)
  content: string

  @ValidateNested()
  @Type(() => AttachmentsDTO)
  attachments: AttachmentsDTO = new AttachmentsDTO()

  @IsNotEmpty()
  @IsEnum(DISCUSSION_REPLY_TYPE)
  type: DISCUSSION_REPLY_TYPE
}
