import { useEffect, useState } from 'react'
import { UseQueryOptions } from '@tanstack/react-query'
import { usePrevious } from '../../hooks/usePrevious'
import { columnFilters } from './columnFilters'
import { APIResource, IMeta, HomeScope } from './types'
import { IColumnWidthLocalStorage, useColumnWidthLocalStorage } from '../../hooks/useColumnWidthLocalStorage'
import { useFilterParams } from './useFilterState'
import { useListQuery } from './useListQuery'
import { ISortByParams, useOrderByParams } from '../../hooks/useOrderByState'
import { usePaginationParams } from '../../hooks/usePaginationState'
import { useHiddenColumnLocalStorage } from '../../hooks/useHiddenColumnLocalStorage'
import { createLocationKey } from '../../utils'

export interface IListProps {
  pagination: ReturnType<typeof usePaginationParams>
  sort: ISortByParams
  filter: Record<string, string>
  colWidth: IColumnWidthLocalStorage
}

type ListType = { [key: string]: {}, meta: IMeta }
interface IUseList<T> {
  spaceId?: string,
  scope?: HomeScope,
  fetchList: any,
  resource: APIResource,
  params?: {
    [key: string]: string | undefined
  }
  queryOptions?: UseQueryOptions<T>
}

const filterReset: Record<string, undefined> = {}
Object.keys(columnFilters).forEach(v => {
  filterReset[v] = undefined
})


export function useList<T extends ListType>({ fetchList, resource, params = {}, queryOptions }: IUseList<T>) {
  const locationKey = createLocationKey(resource, params?.spaceId)
  const { pageParam, perPageParam, setPageParam, setPerPageParam } = usePaginationParams()
  const [selectedIndexes, setSelectedIndexes] = useState<Record<string, boolean> | undefined>({})
  const { sortBy, sort, setSortBy } = useOrderByParams({ onSetSortBy: (cols) => setSelectedIndexes({}) })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(locationKey)
  const { hiddenColumns, saveHiddenColumns } = useHiddenColumnLocalStorage(locationKey)
  
  const resetSelected = () => setSelectedIndexes(undefined)

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
  }, [pageParam, perPageParam, sort, filterQuery, params.scope, params.spaceId])

  const prevScope = usePrevious(params.scope)
  useEffect(() => {
    // skip first render
    if(prevScope) {
      setPageParam(undefined, 'replaceIn')
      setFilterParam(filterReset, 'replaceIn')
    }
  }, [params.scope])

  const query = useListQuery<T>({
    fetchList,
    resource,
    pagination: { page: pageParam, perPage: perPageParam },
    order: { order_by: sort.order_by, order_dir: sort.order_dir },
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
    hiddenColumns,
    saveHiddenColumns,
  }
}
