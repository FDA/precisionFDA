import { PaginationDTO } from '@shared/domain/entity/domain/pagination.dto'
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, Min, ValidateNested } from 'class-validator'
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

  @Type(() => Number)
  @IsInt()
  @Min(1)
  perPage?: number

  // TODO we want to refactor this to filter once FE is ready
  @IsOptional()
  @ValidateNested()
  @Type(() => UserPaginationFilter)
  filters?: UserPaginationFilter

  get filter() {
    return this.filters
  }
}
