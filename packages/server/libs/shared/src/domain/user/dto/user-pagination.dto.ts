import { Type } from 'class-transformer'
import { IsIn, IsOptional, ValidateNested } from 'class-validator'
import { PaginationDTO } from '@shared/domain/entity/domain/pagination.dto'
import { UserPaginationFilter } from '@shared/domain/user/dto/user-pagination-filter'
import { User } from '@shared/domain/user/user.entity'

export class UserPaginationDto extends PaginationDTO<User> {
  @IsOptional()
  @Type(() => String)
  orderBy?: string

  @IsOptional()
  @Type(() => String)
  @IsIn(['DESC', 'ASC'], { message: 'orderDir must be either DESC or ASC' })
  orderDir?: 'DESC' | 'ASC'

  @IsOptional()
  @ValidateNested()
  @Type(() => UserPaginationFilter)
  filter?: UserPaginationFilter
}
