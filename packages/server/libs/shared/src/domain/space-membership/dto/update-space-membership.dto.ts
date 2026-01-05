import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership.enum'

export class UpdateSpaceMembershipDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  membershipIds: number[]

  @IsEnum(SPACE_MEMBERSHIP_ROLE)
  @IsOptional()
  targetRole?: SPACE_MEMBERSHIP_ROLE

  @IsBoolean()
  @IsOptional()
  enabled?: boolean
}
