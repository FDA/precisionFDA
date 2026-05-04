import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/utils/cn'
import { useModal } from '../../features/modal/useModal'
import { useDebounce } from '../Table/useDebounce'
import { useSearchChallenges, useSearchDocs, useSearchExperts, useSearchQuestions } from './queries'
import {
  DISPLAY_NAMES,
  FILTER_OPTIONS,
  type FilterType,
  type GroupedResults,
  type SearchCategory,
  type SearchData,
  type SearchResultWithCategory,
} from './types'

const modalContainer = cn(
  'flex h-full max-h-[90vh] flex-col overflow-hidden rounded-xl max-md:max-h-[95vh] max-md:rounded-lg max-sm:max-h-[98vh]',
)

const modalHeader = cn('flex shrink-0 items-start border-b border-border px-6 py-4 pr-14 max-md:px-4 max-md:pr-12')

const modalTitle = cn('m-0 text-2xl font-bold tracking-tight text-foreground max-md:text-xl max-sm:text-lg')

const section = cn('mb-4 flex flex-col gap-2 pb-4 last:mb-0 last:pb-0 max-md:mb-3 max-md:pb-3')

const searchContainer = cn(
  'flex h-150 min-h-0 flex-1 overflow-hidden rounded-lg bg-background max-md:h-auto max-md:max-h-[calc(95vh-200px)] max-md:flex-col max-sm:max-h-[calc(98vh-150px)]',
)

const searchBar = cn('relative shrink-0 border-b border-border px-6 py-4 max-md:px-4')

const searchBarIconLeft = cn(
  'pointer-events-none absolute left-6 top-1/2 z-10 flex items-center pl-2 -translate-y-1/2 text-muted-foreground max-md:left-4 max-md:pl-1.5',
)

const searchBarClearButton = cn(
  'absolute right-6 top-1/2 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-muted-foreground max-md:right-4',
  'hover:bg-muted hover:text-foreground',
)

const searchInput = cn(
  'box-border w-full min-w-0 rounded-lg border border-input bg-background py-2.5 pl-12 pr-14 font-sans text-sm text-foreground',
  'placeholder:text-muted-foreground max-md:py-2 max-sm:pl-11 max-sm:pr-12 max-sm:text-sm',
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/50',
)

const filterSidebar = cn(
  'w-55 shrink-0 border-r border-border bg-muted/20 p-4 max-md:w-full max-md:flex-row max-md:flex-wrap max-md:items-center max-md:gap-2 max-md:border-b max-md:border-r-0',
)

const filterTitle = cn(
  'm-0 mb-3 w-full text-xs font-semibold uppercase tracking-wide text-muted-foreground max-md:mb-0 max-md:mr-2 max-md:w-auto',
)

const filterOption = cn(
  'group/filterOpt flex w-full cursor-pointer items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm text-muted-foreground',
  'hover:bg-muted/80 max-md:w-auto max-md:shrink-0 max-md:py-1.5 max-md:text-sm',
  'data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary',
)

const filterLabelText = cn('min-w-0 flex-1')

const filterRadio = cn('m-0 size-4 shrink-0 cursor-pointer accent-primary max-md:size-3.5')

/** Fixed-width numeric column so counts share one right edge (desktop sidebar). */
const countPill = cn(
  'inline-flex min-w-6 shrink-0 justify-end rounded-md bg-muted px-1.5 py-0.5 text-right text-xs font-medium tabular-nums text-muted-foreground',
  'group-data-[selected=true]/filterOpt:bg-primary/20 group-data-[selected=true]/filterOpt:text-primary',
)

const searchResults = cn('flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4 max-md:p-4 max-sm:p-3')

const searchResultItem = cn(
  'rounded-lg border border-border bg-background p-3 max-md:p-2.5',
  'hover:border-primary/40 hover:bg-muted/30',
)

const resultLink = cn('flex h-full w-full flex-col no-underline')

const resultTitle = cn('m-0 mb-1 text-sm font-semibold leading-snug text-foreground')

const resultDescription = cn('mb-2 line-clamp-2 flex-1 text-xs leading-normal text-muted-foreground')

const resultViewMore = cn('text-xs font-medium text-primary')

const sectionHeader = cn(
  'm-0 mb-2 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
)

const viewMoreButton = cn(
  '!mx-auto !my-3 flex items-center gap-1.5 !rounded-full !border-0 !px-4 !py-2 text-xs font-semibold max-md:!my-2 max-md:!px-3 max-md:!py-1.5',
)

const emptyState = cn(
  'flex min-h-50 flex-col items-center justify-center gap-4 p-8 text-center text-muted-foreground max-md:min-h-45 max-md:p-6',
  '[&>svg]:size-12 [&>svg]:shrink-0 max-md:[&>svg]:size-10',
  '[&_p]:m-0 [&_p]:max-w-sm [&_p]:text-sm [&_p]:leading-relaxed',
)

const noResultLead = cn('font-semibold text-foreground')

const withListKeys = (items: SearchResultWithCategory[]): SearchResultWithCategory[] =>
  items.map(item => ({ ...item, listKey: crypto.randomUUID() }))

const withGroupedListKeys = (grouped: GroupedResults): GroupedResults => {
  const out: GroupedResults = {}
  for (const key of Object.keys(grouped) as SearchCategory[]) {
    const items = grouped[key]
    if (items?.length) {
      out[key] = withListKeys(items)
    }
  }
  return out
}

const getAllResults = (
  searchData: SearchData,
): {
  results: SearchResultWithCategory[]
  groupedResults: GroupedResults
} => {
  const { docs, challenges, experts, questions } = searchData
  const allResults: GroupedResults = {}

  if (docs?.length) {
    allResults.documentation = docs.map(r => ({ ...r, category: 'documentation' }))
  }
  if (challenges?.length) {
    allResults.challenges = challenges.map(r => ({ ...r, category: 'challenges' }))
  }
  if (experts?.length) {
    allResults['expert-blogs'] = experts.map(r => ({ ...r, category: 'expert-blogs' }))
  }
  if (questions?.length) {
    allResults['qa-pages'] = questions.map(r => ({ ...r, category: 'qa-pages' }))
  }

  const groupedResults: GroupedResults = {}
  let results: SearchResultWithCategory[] = []

  Object.entries(allResults).forEach(([categoryKey, categoryResults]) => {
    const category = categoryKey as SearchCategory
    const list = categoryResults ?? []
    const resultsToShow = list.slice(0, 3)
    const hasMoreResults = list.length > 3

    // Add hasMore flag to the last result if there are more
    if (hasMoreResults) {
      resultsToShow[2] = { ...resultsToShow[2], hasMore: true }
    }

    groupedResults[category] = resultsToShow
    results = results.concat(resultsToShow)
  })

  return { results, groupedResults }
}

const getFilteredResultsByCategory = (searchData: SearchData, category: SearchCategory): SearchResultWithCategory[] => {
  const { docs, challenges, experts, questions } = searchData

  switch (category) {
    case 'documentation':
      return docs?.length ? docs.map(r => ({ ...r, category: 'documentation' })) : []
    case 'challenges':
      return challenges?.length ? challenges.map(r => ({ ...r, category: 'challenges' })) : []
    case 'expert-blogs':
      return experts?.length ? experts.map(r => ({ ...r, category: 'expert-blogs' })) : []
    case 'qa-pages':
      return questions?.length ? questions.map(r => ({ ...r, category: 'qa-pages' })) : []
    default:
      return []
  }
}

const getFilteredResults = (
  searchQuery: string,
  selectedFilter: FilterType,
  searchData: SearchData,
): {
  results: SearchResultWithCategory[]
  groupedResults?: GroupedResults
} => {
  if (!searchQuery.trim()) return { results: [] }

  if (selectedFilter === 'all') {
    return getAllResults(searchData)
  } else {
    const results = getFilteredResultsByCategory(searchData, selectedFilter)
    return { results }
  }
}

const EmptySearchState = () => (
  <div className={emptyState}>
    <Search aria-hidden strokeWidth={1.75} />
    <p>Enter a search term to find content</p>
  </div>
)

const LoadingState = () => (
  <div className={emptyState}>
    <Search aria-hidden strokeWidth={1.75} />
    <p>Searching...</p>
  </div>
)

const NoResultsState = ({ searchQuery }: { searchQuery: string }) => (
  <div className={emptyState}>
    <p className={noResultLead}>No results found for &quot;{searchQuery}&quot;</p>
    <p>Try adjusting your search terms or filters</p>
  </div>
)

const SearchResultItemComponent = ({
  result,
  onLinkClick,
}: {
  result: SearchResultWithCategory
  onLinkClick: () => void
}) => {
  const itemContent = (
    <>
      <h4 className={resultTitle}>{result.title}</h4>
      <p className={resultDescription}>{result.description}</p>
      <span className={resultViewMore}>View more →</span>
    </>
  )

  return (
    <div className={searchResultItem}>
      {['documentation', 'qa-pages'].includes(result.category) ? (
        <a className={resultLink} href={result.link} onClick={onLinkClick}>
          {itemContent}
        </a>
      ) : (
        <Link className={resultLink} to={result.link} onClick={onLinkClick}>
          {itemContent}
        </Link>
      )}
    </div>
  )
}

const GroupedSearchResults = ({
  groupedResults,
  onViewMore,
  onLinkClick,
}: {
  groupedResults: GroupedResults
  onViewMore: (category: SearchCategory) => void
  onLinkClick: () => void
}) => (
  <>
    {Object.entries(groupedResults).map(([categoryKey, categoryResults]) => {
      const category = categoryKey as SearchCategory
      const displayName = DISPLAY_NAMES[category]
      return (
        <div key={category} className={section}>
          <h3 className={sectionHeader}>{displayName}</h3>
          {(categoryResults ?? []).map(result => (
            <SearchResultItemComponent key={result.listKey} result={result} onLinkClick={onLinkClick} />
          ))}
          {(categoryResults ?? []).some(r => r.hasMore) && (
            <Button type="button" variant="default" className={viewMoreButton} onClick={() => onViewMore(category)}>
              View all results for {displayName}
            </Button>
          )}
        </div>
      )
    })}
  </>
)

const FlatSearchResults = ({
  results,
  onLinkClick,
}: {
  results: SearchResultWithCategory[]
  onLinkClick: () => void
}) => (
  <div className={section}>
    {results.map(result => (
      <SearchResultItemComponent key={result.listKey} result={result} onLinkClick={onLinkClick} />
    ))}
  </div>
)

const SearchResultsContent = ({
  searchQuery,
  isLoading,
  results,
  selectedFilter,
  groupedResults,
  onViewMore,
  onLinkClick,
}: {
  searchQuery: string
  isLoading: boolean
  results: SearchResultWithCategory[]
  selectedFilter: FilterType
  groupedResults?: GroupedResults
  onViewMore: (category: SearchCategory) => void
  onLinkClick: () => void
}) => {
  if (!searchQuery.trim()) {
    return <EmptySearchState />
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (results.length === 0) {
    return <NoResultsState searchQuery={searchQuery} />
  }

  if (selectedFilter === 'all' && groupedResults) {
    return <GroupedSearchResults groupedResults={groupedResults} onViewMore={onViewMore} onLinkClick={onLinkClick} />
  }

  return <FlatSearchResults results={results} onLinkClick={onLinkClick} />
}

export const SearchModal = ({ isShown, hide }: { isShown: boolean; hide: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debouncedSearchQuery = useDebounce(searchQuery, 200)

  const { data: challenges, isLoading: challengesLoading } = useSearchChallenges(debouncedSearchQuery, selectedFilter)
  const { data: experts, isLoading: expertsLoading } = useSearchExperts(debouncedSearchQuery, selectedFilter)
  const { data: questions, isLoading: questionsLoading } = useSearchQuestions(debouncedSearchQuery, selectedFilter)
  const { data: docs, isLoading: docsLoading } = useSearchDocs(debouncedSearchQuery, selectedFilter)

  const resultCounts = useMemo(
    () => ({
      challenges: challenges?.length,
      'expert-blogs': experts?.length,
      'qa-pages': questions?.length,
      documentation: docs?.length,
    }),
    [challenges, experts, questions, docs],
  )

  useEffect(() => {
    if (isShown && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isShown])

  const isLoading = challengesLoading || expertsLoading || questionsLoading || docsLoading

  const isSearching = searchQuery.trim() !== debouncedSearchQuery.trim() || isLoading

  const { results, groupedResults } = useMemo(() => {
    const raw = getFilteredResults(debouncedSearchQuery, selectedFilter, {
      docs,
      challenges,
      experts,
      questions,
    })
    if (raw.groupedResults) {
      return {
        results: withListKeys(raw.results),
        groupedResults: withGroupedListKeys(raw.groupedResults),
      }
    }
    return {
      results: withListKeys(raw.results),
      groupedResults: undefined,
    }
  }, [debouncedSearchQuery, selectedFilter, docs, challenges, experts, questions])

  const getCountText = (filterOption: FilterType) => {
    if (filterOption === 'all') {
      const allCounts = Object.values(resultCounts)

      if (allCounts.every(count => count === undefined)) {
        return isSearching && debouncedSearchQuery.trim() === '' ? undefined : 0
      }

      return allCounts.reduce<number>((sum, count) => sum + (count || 0), 0)
    }

    const count = resultCounts?.[filterOption]

    return count === undefined && isSearching && debouncedSearchQuery.trim() !== '' ? 0 : count
  }

  const handleViewMore = (category: SearchCategory) => {
    setSelectedFilter(category)
  }

  const onCancelSearchClick = () => {
    setSearchQuery('')
    setSelectedFilter('all')
  }

  return (
    <Dialog open={isShown} onOpenChange={open => !open && hide()}>
      <DialogContent
        id="global-search-modal"
        data-testid="global-search-modal"
        showCloseButton
        className="flex h-[min(80vh,700px)] max-h-[90vh] w-[min(80vw,1000px)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(1000px,calc(100%-2rem))]"
      >
        <div className={modalContainer}>
          <div className={modalHeader}>
            <DialogTitle className={modalTitle}>Global Search</DialogTitle>
          </div>
          <div className={searchBar}>
            <div className={searchBarIconLeft}>
              <Search aria-hidden className="size-[18px] shrink-0" strokeWidth={2} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className={searchInput}
              placeholder="Search for documentation, challenges, expert blogs, and Q&A..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery?.length ? (
              <button
                className={searchBarClearButton}
                type="button"
                onClick={onCancelSearchClick}
                aria-label="Clear search"
              >
                <X aria-hidden className="size-3.5" strokeWidth={2} />
              </button>
            ) : null}
          </div>
          <div className={searchContainer}>
            <div className={filterSidebar}>
              <h3 className={filterTitle}>Filter By</h3>
              {FILTER_OPTIONS.map(option => (
                <label
                  key={option}
                  className={filterOption}
                  data-selected={selectedFilter === option ? 'true' : 'false'}
                >
                  <input
                    className={filterRadio}
                    type="radio"
                    name="searchFilter"
                    value={option}
                    checked={selectedFilter === option}
                    onChange={e => setSelectedFilter(e.target.value as FilterType)}
                  />
                  <span className={filterLabelText}>{DISPLAY_NAMES[option]}</span>
                  <span className={countPill}>{getCountText(option)}</span>
                </label>
              ))}
            </div>
            <div className={searchResults}>
              <SearchResultsContent
                searchQuery={searchQuery}
                isLoading={isSearching}
                results={results}
                selectedFilter={selectedFilter}
                groupedResults={groupedResults}
                onViewMore={handleViewMore}
                onLinkClick={hide}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function useSearchModal() {
  const { isShown, setShowModal } = useModal()

  const modalComp = <SearchModal isShown={isShown} hide={() => setShowModal(false)} />

  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
