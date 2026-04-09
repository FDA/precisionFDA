import { Type } from 'class-transformer'
import { IsIn, IsNumber, IsString, MinLength, ValidateIf, ValidateNested } from 'class-validator'
import { CliAttachmentsDTO } from '@shared/domain/cli/dto/cli-attachments.dto'

export class CliCreateReplyDTO {
  @ValidateIf(obj => !obj.answerId)
  @IsNumber()
  discussionId?: number

  @ValidateIf(obj => !obj.discussionId)
  @IsNumber()
  answerId?: number

  @IsString()
  @IsIn(['answer', 'comment'])
  replyType: 'answer' | 'comment'

  @IsString()
  @MinLength(1)
  content: string

  @ValidateIf(obj => obj.replyType === 'answer')
  @ValidateNested()
  @Type(() => CliAttachmentsDTO)
  attachments: CliAttachmentsDTO = new CliAttachmentsDTO()
}
