import { IsInt, Min } from 'class-validator'

export class InvitationToSpaceDTO {
  @IsInt()
  @Min(1)
  membershipId: number

  @IsInt()
  @Min(1)
  adminId: number
}
