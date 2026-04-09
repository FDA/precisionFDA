import { IsIn, IsString } from 'class-validator'
import { SearchableEntityType, searchableEntities } from '@shared/facade/search/domain/searchable-entity.type'

export class SearchDTO {
  @IsString()
  query: string

  @IsIn(searchableEntities)
  entityType: SearchableEntityType
}
