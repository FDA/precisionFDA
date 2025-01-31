import { IsNotEmpty, IsString } from 'class-validator'

export class CreateChallengeResourceDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  description: string
}
