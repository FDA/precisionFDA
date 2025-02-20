import { IsInt, IsString, Min } from 'class-validator'

export class ChallengeCreatedDTO {
  @IsInt()
  @Min(1)
  challengeId: number

  @IsString()
  name: string

  @IsString()
  scope: string
}
