import { IsNumber, IsString } from 'class-validator'

export class SpaceLeadRecoverDTO {
  @IsNumber()
  currentLeadMembershipId: number

  @IsString()
  newLeadDxuser: string
}
