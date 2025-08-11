export type SearchableEntityType = 'challenge' | 'expert' | 'expertQuestion'

export interface SearchRequestParams {
  query: string
  entityType: SearchableEntityType
}

export type SearchResult = {
  title: string
  description: string
  link: string
}

export type SearchResponse = SearchResult[]