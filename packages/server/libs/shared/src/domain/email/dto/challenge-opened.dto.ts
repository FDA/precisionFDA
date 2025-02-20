import { IsInt, Min } from 'class-validator'

export class ChallengeOpenedDTO {
  @IsInt()
  @Min(1)
  challengeId: number
}
