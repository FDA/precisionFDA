import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { ModalNext } from '../../features/modal/ModalNext'
import { useModal } from '../../features/modal/useModal'
import { CloseIcon } from '../icons/CloseIcon'
import { SearchIcon } from '../icons/SearchIcon'
import { InputText } from '../InputText'
import { useDebounce } from '../Table/useDebounce'
import { useSearchChallenges, useSearchDocs, useSearchExperts, useSearchQuestions } from './queries'
import {
  CountPill,
  EmptyState,
  FilterOption,
  FilterSidebar,
  FilterTitle,
  Header,
  HeaderContent,
  ModalContainer,
  ResultDescription,
  ResultLink,
  ResultTitle,
  SearchBar,
  SearchContainer,
  SearchResultItem,
  SearchResults,
  Section,
  SectionHeader,
  Title,
  ViewMoreButton,
} from './styles'

import {
  DISPLAY_NAMES,
  FILTER_OPTIONS,
  FilterType,
  GroupedResults,
  SearchCategory,
  SearchData,
  SearchResultWithCategory,
} from './types'
import { CloseButton } from '../../features/modal/styles'
import { PlusIcon } from '../icons/PlusIcon'

const NoResultText = styled.p`
  font-weight: bold;
`

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
    const resultsToShow = categoryResults!.slice(0, 3)
    const hasMoreResults = categoryResults!.length > 3

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
  if (!searchQuery.trim()) return { results: []}

  if (selectedFilter === 'all') {
    return getAllResults(searchData)
  } else {
    const results = getFilteredResultsByCategory(searchData, selectedFilter)
    return { results }
  }
}

const EmptySearchState = () => (
  <EmptyState>
    <SearchIcon height={48} />
    <p>Enter a search term to find content</p>
  </EmptyState>
)

const LoadingState = () => (
  <EmptyState>
    <SearchIcon height={48} />
    <p>Searching...</p>
  </EmptyState>
)

const NoResultsState = ({ searchQuery }: { searchQuery: string }) => (
  <EmptyState>
    <NoResultText>No results found for &quot;{searchQuery}&quot;</NoResultText>
    <p>Try adjusting your search terms or filters</p>
  </EmptyState>
)

const SearchResultItemComponent = ({ result, onLinkClick }: { result: SearchResultWithCategory; onLinkClick: () => void }) => {
  const ItemContent = (
    <>
      <ResultTitle>{result.title}</ResultTitle>
      <ResultDescription>{result.description}</ResultDescription>
      <span>View more</span>
    </>
  )

  return (
    <SearchResultItem>
      {['documentation', 'qa-pages'].includes(result.category) ? (
        <ResultLink href={result.link} as="a" onClick={onLinkClick}>
          {ItemContent}
        </ResultLink>
      ) : (
        <ResultLink as={Link} to={result.link} onClick={onLinkClick}>
          {ItemContent}
        </ResultLink>
      )}
    </SearchResultItem>
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
        <Section key={category}>
          <SectionHeader>{displayName}</SectionHeader>
          {categoryResults!.map((result, index) => (
            <SearchResultItemComponent key={index} result={result} onLinkClick={onLinkClick} />
          ))}
          {categoryResults!.some(r => r.hasMore) && (
            <ViewMoreButton data-variant="primary" onClick={() => onViewMore(category)}>
              View all results for {displayName}
            </ViewMoreButton>
          )}
        </Section>
      )
    })}
  </>
)

const FlatSearchResults = ({ results, onLinkClick }: { results: SearchResultWithCategory[]; onLinkClick: () => void }) => (
  <Section>
    {results.map((result, index) => (
      <SearchResultItemComponent key={index} result={result} onLinkClick={onLinkClick} />
    ))}
  </Section>
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

  const { results, groupedResults } = getFilteredResults(debouncedSearchQuery, selectedFilter, {
    docs,
    challenges,
    experts,
    questions,
  })

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
    <ModalNext id="global-search-modal" data-testid="global-search-modal" isShown={isShown} hide={hide} variant="large">
      <ModalContainer>
        <Header>
          <HeaderContent>
            <Title>Global Search</Title>
          </HeaderContent>
          <CloseButton data-testid="modal-close-button" type="button" data-dismiss="modal" aria-label="Close" onClick={hide}>
            <PlusIcon height={16} />
          </CloseButton>
        </Header>
        <SearchBar>
          <div className="iconwrap">
            <SearchIcon height={18} />
          </div>
          <InputText
            ref={searchInputRef}
            placeholder="Search for documentation, challenges, expert blogs, and Q&A..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery?.length ? (
            <button
              className="iconwrap iconwrap-right"
              type="button"
              onClick={onCancelSearchClick}
              aria-label="Clear search"
            >
              <CloseIcon height={14} />
            </button>
          ) : null}
        </SearchBar>
        <SearchContainer>
          <FilterSidebar>
            <FilterTitle>Filter By</FilterTitle>
            {FILTER_OPTIONS.map(option => (
              <FilterOption key={option} data-selected={selectedFilter === option}>
                <input
                  type="radio"
                  name="searchFilter"
                  value={option}
                  checked={selectedFilter === option}
                  onChange={e => setSelectedFilter(e.target.value as FilterType)}
                />
                {DISPLAY_NAMES[option]}
                {<CountPill>{getCountText(option)}</CountPill>}
              </FilterOption>
            ))}
          </FilterSidebar>
          <SearchResults>
            <SearchResultsContent
              searchQuery={searchQuery}
              isLoading={isSearching}
              results={results}
              selectedFilter={selectedFilter}
              groupedResults={groupedResults}
              onViewMore={handleViewMore}
              onLinkClick={hide}
            />
          </SearchResults>
        </SearchContainer>
      </ModalContainer>
    </ModalNext>
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
