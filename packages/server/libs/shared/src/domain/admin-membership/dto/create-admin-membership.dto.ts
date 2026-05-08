import { Type } from 'class-transformer'
import { IsEnum, IsInt } from 'class-validator'
import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'

export class CreateAdminMembershipDTO {
  @Type(() => Number)
  @IsInt()
  userId: number

  @Type(() => Number)
  @IsEnum(ADMIN_GROUP_ROLES)
  group: ADMIN_GROUP_ROLES
}
