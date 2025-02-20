import { IsInt, IsOptional, Min, IsString } from 'class-validator'

export class MemberChangedDTO {
  @IsInt()
  @Min(1)
  updatedMembershipId: number

  @IsInt()
  @Min(1)
  initUserId: number

  @IsInt()
  @Min(1)
  spaceId: number

  @IsString()
  activityType: string

  @IsOptional()
  @IsString()
  newMembershipRole?: string
}
