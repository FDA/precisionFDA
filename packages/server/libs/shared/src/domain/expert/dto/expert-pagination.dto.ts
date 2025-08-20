import { PaginationDTO, SortDefinition } from '@shared/domain/entity/domain/pagination.dto'
import { IsInt, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { QueryOrder } from '@mikro-orm/core'

class ExpertFilter {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year: number
}

export class ExpertPaginationDTO extends PaginationDTO<Expert> {
  @IsOptional()
  @ValidateNested()
  @Type(() => ExpertFilter)
  filter?: ExpertFilter

  sort?: SortDefinition<Expert> = { createdAt: QueryOrder.DESC }
}
