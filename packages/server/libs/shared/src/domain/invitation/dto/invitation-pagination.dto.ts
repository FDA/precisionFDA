import { QueryOrder } from '@mikro-orm/core'
import { PaginationDTO, SortDefinition } from '@shared/domain/entity/domain/pagination.dto'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { Invitation } from '../invitation.entity'
import { PROVISIONING_STATE } from '../invitation.enum'

class InvitationFilter {
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
  sort?: SortDefinition<Invitation> = { createdAt: QueryOrder.DESC }
}
