import { IsNotEmpty, IsString } from 'class-validator'

export class CreateSpaceGroupDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  description: string
}
