import { UseQueryOptions } from '@tanstack/react-query'
import { useEffect } from 'react'
import { IColumnWidthLocalStorage, useColumnWidthLocalStorage } from '../../hooks/useColumnWidthLocalStorage'
import { useHiddenColumnLocalStorage } from '../../hooks/useHiddenColumnLocalStorage'
import { useOrderByParams } from '../../hooks/useOrderByState'
import { usePaginationParams } from '../../hooks/usePaginationState'
import { usePrevious } from '../../hooks/usePrevious'
import { createLocationKey } from '../../utils'
import { SortByParams } from '../../types/sorting'
import { columnFilters } from './columnFilters'
import { APIResource, HomeScope, IFilter, IMeta, MetaV2 } from './types'
import { useFilterParams } from './useFilterState'
import { useListQuery } from './useListQuery'
import { useListSelect } from './useListSelect'
import { Params } from './utils'

export type FetchListFn<T = unknown> = (filter: IFilter[], params: Params) => Promise<T>

export interface IListProps {
  pagination: ReturnType<typeof usePaginationParams>
  sort: SortByParams
  filter: Record<string, string>
  colWidth: IColumnWidthLocalStorage
}

type ListType = { [key: string]: unknown, meta: IMeta | MetaV2 }
interface IUseList<T> {
  spaceId?: string,
  scope?: HomeScope,
  fetchList: FetchListFn<T>,
  resource: APIResource,
  params?: Params
  queryOptions?: UseQueryOptions<T>
}

const filterReset: Record<string, undefined> = {}
Object.keys(columnFilters).forEach(v => {
  filterReset[v] = undefined
})


export function useList<T extends ListType>({ fetchList, resource, params = {}}: IUseList<T>) {
  const locationKey = createLocationKey(resource, params?.spaceId)
  const { pageParam, perPageParam, setPageParam, setPerPageParam } = usePaginationParams()
  const { selectedIndexes, setSelectedIndexes } = useListSelect()
  const { sortBy, sort, setSortBy } = useOrderByParams({ onSetSortBy: () => setSelectedIndexes({}) })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(locationKey)
  const { columnVisibility, setColumnVisibility } = useHiddenColumnLocalStorage(locationKey)

  const resetSelected = () => setSelectedIndexes({})

  const { filterQuery, setSearchFilter, setFilterParam } = useFilterParams({
    filters: columnFilters,
    onSetFilter: () => {
      setSelectedIndexes({})
      setPageParam(1, 'replaceIn')
    },
  })

  useEffect(() => {
    // Reset selected rows if pageParam, perPageParam, sort, filterQuery, scope, spaceId change 
    resetSelected()
  }, [pageParam, perPageParam, sort, params.scope, params.spaceId])

  const prevScope = usePrevious(params.scope)
  useEffect(() => {
    // skip first render
    if (prevScope) {
      setPageParam(undefined, 'replaceIn')
      setFilterParam(filterReset, 'replaceIn')
    }
  }, [params.scope])

  const query = useListQuery<T>({
    fetchList,
    resource,
    pagination: { page: pageParam, perPage: perPageParam },
    sort,
    filter: filterQuery,
    params,
  })

  return {
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    setSelectedIndexes,
    resetSelected,
    setSortBy,
    sortBy,
    query,
    selectedIndexes,
    filterQuery,
    perPageParam,
    saveColumnResizeWidth,
    colWidths,
    columnVisibility,
    setColumnVisibility,
  }
}
