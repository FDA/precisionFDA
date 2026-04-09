import { Type } from 'class-transformer'
import { IsNumber, IsString, ValidateIf, ValidateNested } from 'class-validator'
import { CliAttachmentsDTO } from '@shared/domain/cli/dto/cli-attachments.dto'

export class CliEditReplyDTO {
  @ValidateIf(obj => !obj.commentId)
  @IsNumber()
  answerId: number

  @ValidateIf(obj => !obj.answerId)
  @IsNumber()
  commentId: number

  @IsString()
  content: string

  @ValidateIf(obj => obj.answerId)
  @ValidateNested()
  @Type(() => CliAttachmentsDTO)
  attachments: CliAttachmentsDTO = new CliAttachmentsDTO()
}
