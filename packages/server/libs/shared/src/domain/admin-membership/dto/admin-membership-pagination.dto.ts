import { Type } from 'class-transformer'
import { IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'
import { PaginationDTO } from '@shared/domain/entity/domain/pagination.dto'
import { User } from '@shared/domain/user/user.entity'

class AdminMembershipPaginationFilter {
  @IsOptional()
  @Type(() => String)
  dxuser?: string

  @IsOptional()
  @Type(() => String)
  email?: string

  @IsOptional()
  @Type(() => Number)
  @IsEnum(ADMIN_GROUP_ROLES)
  role?: ADMIN_GROUP_ROLES
}

export class AdminMembershipPaginationDTO extends PaginationDTO<User> {
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminMembershipPaginationFilter)
  filter?: AdminMembershipPaginationFilter
}
