import { Type } from 'class-transformer'
import { IsOptional, IsString, MinLength, ValidateNested } from 'class-validator'
import { CliAttachmentsDTO } from '@shared/domain/cli/dto/cli-attachments.dto'

export class CliEditReplyDTO {
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => CliAttachmentsDTO)
  attachments?: CliAttachmentsDTO
}
