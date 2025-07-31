import { SearchResult } from '../../features/search/types'

export type SearchCategory = 'documentation' | 'challenges' | 'expert-blogs' | 'qa-pages'
export type FilterType = 'all' | SearchCategory

export const FILTER_OPTIONS: FilterType[] = ['all', 'documentation', 'challenges', 'expert-blogs', 'qa-pages']

export const DISPLAY_NAMES: Record<FilterType, string> = {
  'all': 'All',
  'documentation': 'Documentation',
  'challenges': 'Challenges',
  'expert-blogs': 'Expert Blogs',
  'qa-pages': 'Q&A pages',
}

export type SearchResultWithCategory = SearchResult & { category: SearchCategory; hasMore?: boolean }
export type GroupedResults = Partial<Record<SearchCategory, SearchResultWithCategory[]>>

export type SearchData = {
  docs?: SearchResult[]
  challenges?: SearchResult[]
  experts?: SearchResult[]
  questions?: SearchResult[]
}
