import { IsString, ValidateNested, MinLength } from 'class-validator'
import { Type } from 'class-transformer'
import { AttachmentsDTO } from './attachments.dto'

export class UpdateAnswerDTO {
  @IsString()
  @MinLength(1)
  content: string

  @ValidateNested()
  @Type(() => AttachmentsDTO)
  attachments: AttachmentsDTO = new AttachmentsDTO()
}
