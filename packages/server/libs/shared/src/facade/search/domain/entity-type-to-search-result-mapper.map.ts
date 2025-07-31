import { SearchableEntityType } from '@shared/facade/search/domain/searchable-entity.type'
import { SearchResultMapper } from '@shared/facade/search/result-mapper/search-result-mapper'

export type EntityTypeToSearchResultMapperMap = {
  [K in SearchableEntityType]: SearchResultMapper<K>
}
