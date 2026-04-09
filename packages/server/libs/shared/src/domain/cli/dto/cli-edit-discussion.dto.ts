import { Type } from 'class-transformer'
import { IsOptional, IsString, ValidateNested } from 'class-validator'
import { CliAttachmentsDTO } from '@shared/domain/cli/dto/cli-attachments.dto'

export class CliEditDiscussionDTO {
  @IsOptional()
  @IsString()
  content: string

  @ValidateNested()
  @Type(() => CliAttachmentsDTO)
  attachments: CliAttachmentsDTO = new CliAttachmentsDTO()
}
