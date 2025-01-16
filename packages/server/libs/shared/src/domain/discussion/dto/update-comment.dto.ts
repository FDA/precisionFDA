import { IsString, MinLength } from 'class-validator'

export class UpdateCommentDTO {
  @IsString()
  @MinLength(1)
  content: string
}
