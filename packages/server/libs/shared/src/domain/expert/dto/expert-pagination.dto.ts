import { PaginationDto } from '@shared/domain/entity/domain/pagination.dto'
import { IsInt, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { Expert } from '@shared/domain/expert/expert.entity'

class ExpertFilter {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year: number
}
export class ExpertPaginationDTO extends PaginationDto<Expert> {
  @IsOptional()
  @ValidateNested()
  @Type(() => ExpertFilter)
  filter?: ExpertFilter
}
