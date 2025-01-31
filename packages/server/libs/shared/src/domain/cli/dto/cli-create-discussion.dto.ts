import { IsString, ValidateNested, MinLength } from 'class-validator'
import { Type } from 'class-transformer'
import { CliAttachmentsDTO } from '@shared/domain/cli/dto/cli-attachments.dto'

export class CliCreateDiscussionDTO {
  @IsString()
  @MinLength(1)
  title: string

  @IsString()
  @MinLength(1)
  content: string

  @ValidateNested()
  @Type(() => CliAttachmentsDTO)
  attachments: CliAttachmentsDTO = new CliAttachmentsDTO()
}
