import { IsInt } from 'class-validator'

export class AssignScoringAppDTO {
  @IsInt()
  appId: number
}
