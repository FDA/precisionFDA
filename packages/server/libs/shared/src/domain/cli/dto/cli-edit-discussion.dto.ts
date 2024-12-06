import { IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CliAttachmentsDTO } from '@shared/domain/cli/dto/cli-attachments.dto'

export class CliEditDiscussionDTO {
  @IsString()
  content: string

  @ValidateNested()
  @Type(() => CliAttachmentsDTO)
  attachments: CliAttachmentsDTO = new CliAttachmentsDTO()
}
