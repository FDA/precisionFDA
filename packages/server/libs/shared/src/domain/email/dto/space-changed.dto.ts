import { IsInt, Min, IsString, IsOptional } from 'class-validator'

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
