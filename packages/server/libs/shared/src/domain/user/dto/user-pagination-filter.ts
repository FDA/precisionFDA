import { USER_STATE } from '@shared/domain/user/user.entity'
import { IsEnum, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class UserPaginationFilter {
  @IsOptional()
  @Type(() => String)
  dxuser?: string

  @IsOptional()
  @Type(() => String)
  email?: string

  @IsOptional()
  @Type(() => String)
  lastLogin?: string // its a date range <startDate, endDate>

  @IsOptional()
  @Type(() => Number)
  @IsEnum(USER_STATE)
  userState?: USER_STATE

  @IsOptional()
  totalLimit?: string // its a number range <beginning, end>

  @IsOptional()
  @Type(() => String)
  jobLimit?: string // its a number range <beginning, end>
}
