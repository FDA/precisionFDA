import { Type } from 'class-transformer'
import { IsInt, IsOptional, Min } from 'class-validator'
import { OrderDefinition, QueryOrder } from '@mikro-orm/core'

//TODO PFDA-6051: Ludvik - revisit if we need this custom type.
export type SortDefinition<Entity extends object> = Partial<{ [key in keyof Entity]: QueryOrder }>

export class PaginationDTO<Entity extends object> {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10

  // TODO(PFDA-6051) - validation
  @IsOptional()
  sort?: SortDefinition<Entity> & OrderDefinition<Entity> = {}
}
