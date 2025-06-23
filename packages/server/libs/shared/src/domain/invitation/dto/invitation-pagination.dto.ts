import { QueryOrder } from '@mikro-orm/core'
import { PaginationDTO } from '@shared/domain/entity/domain/pagination.dto'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import { Invitation } from '../invitation.entity'
import { PROVISIONING_STATE } from '../invitation.enum'

class InvitationFilter {
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return []
    if (typeof value === 'string') {
      value = value.split(',')
    }
    return value.map((id) => parseInt(id))
  })
  @IsNumber({}, { each: true })
  ids: number[]

  @IsOptional()
  @Type(() => String)
  firstName?: string

  @IsOptional()
  @Type(() => String)
  lastName?: string

  @IsOptional()
  @Type(() => String)
  email?: string

  @IsOptional()
  @Type(() => String)
  @IsEnum(PROVISIONING_STATE)
  provisioningState?: PROVISIONING_STATE

  @IsOptional()
  @Type(() => String)
  createdAt?: string // its a date range <startDate, endDate>
}

export class InvitationPaginationDTO extends PaginationDTO<Invitation> {
  @IsOptional()
  @ValidateNested()
  @Type(() => InvitationFilter)
  filter?: InvitationFilter

  @IsOptional()
  sortBy?: string = 'createdAt'

  @IsOptional()
  sortDir?: string = QueryOrder.DESC
}
