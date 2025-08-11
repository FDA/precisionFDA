import {
  searchableEntities,
  SearchableEntityType,
} from '@shared/facade/search/domain/searchable-entity.type'
import { IsIn, IsString } from 'class-validator'

export class SearchDTO {
  @IsString()
  query: string

  @IsIn(searchableEntities)
  entityType: SearchableEntityType
}
