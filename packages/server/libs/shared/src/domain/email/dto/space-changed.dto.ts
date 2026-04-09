import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class SpaceChangedDTO {
  @IsInt()
  @Min(1)
  initUserId: number

  @IsInt()
  @Min(1)
  spaceId: number

  @IsOptional()
  @IsInt()
  @Min(1)
  spaceMembershipId?: number

  @IsString()
  activityType: string
}
