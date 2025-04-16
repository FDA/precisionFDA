import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator'

export class SpaceMembershipDTO {
  @IsInt()
  @IsNotEmpty()
  id: number

  @IsEnum(SPACE_MEMBERSHIP_SIDE)
  @IsNotEmpty()
  side: SPACE_MEMBERSHIP_SIDE

  @IsEnum(SPACE_MEMBERSHIP_ROLE)
  @IsNotEmpty()
  role: SPACE_MEMBERSHIP_ROLE
}
