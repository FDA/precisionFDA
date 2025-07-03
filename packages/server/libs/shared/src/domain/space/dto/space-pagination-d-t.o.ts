import { PaginationDTO, SortDefinition } from '@shared/domain/entity/domain/pagination.dto'
import { Type } from 'class-transformer'
import { IsOptional, ValidateNested } from 'class-validator'
import { Space } from '@shared/domain/space/space.entity'
import { SpacePaginationFilter } from '@shared/domain/space/dto/space-pagination-filter'
import { QueryOrder } from '@mikro-orm/core'

export class SpacePaginationDTO extends PaginationDTO<Space> {
  @IsOptional()
  @ValidateNested()
  @Type(() => SpacePaginationFilter)
  filter?: SpacePaginationFilter

  @IsOptional()
  sort?: SortDefinition<Space> = { createdAt: QueryOrder.DESC }
}
