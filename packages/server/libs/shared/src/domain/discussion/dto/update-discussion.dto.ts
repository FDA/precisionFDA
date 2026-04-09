import { Type } from 'class-transformer'
import { IsOptional, IsString, MinLength, ValidateNested } from 'class-validator'
import { AttachmentsDTO } from './attachments.dto'

export class UpdateDiscussionDTO {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  content: string

  @ValidateNested()
  @Type(() => AttachmentsDTO)
  attachments: AttachmentsDTO = new AttachmentsDTO()
}
