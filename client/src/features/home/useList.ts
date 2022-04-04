import { useEffect, useState } from 'react'
import { UseQueryOptions } from 'react-query'
import { APIResource, IMeta, ResourceScope } from './types'
import { useColumnWidthLocalStorage } from './useColumnWidthLocalStorage'
import { useFilterParams } from './useFilterState'
import { useListQuery } from './useListQuery'
import { useOrderByParams } from './useOrderByState'
import { usePaginationParams } from './usePaginationState'


type ListType = { [key: string]: {}, meta: IMeta }
interface IUseList<T> {
  spaceId?: string,
  scope?: ResourceScope,
  fetchList: any,
  resource: APIResource,
  onRowClick: any,
  params?: {
    [key: string]: string | undefined
  }
  queryOptions?: UseQueryOptions<T>
}


export function useList<T extends ListType>({ spaceId, scope, fetchList, resource, params = {}, queryOptions }: IUseList<T>) {
  const { pageParam, perPageParam, setPageParam, setPerPageParam } = usePaginationParams()
  const { sortBy, sort, setSortBy } = useOrderByParams({ onSetSortBy: (cols) => setSelectedIndexes({}) })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(resource)
  const [selectedIndexes, setSelectedIndexes] = useState<Record<string, boolean> | undefined>({})
  const resetSelected = () => setSelectedIndexes(undefined)

  const { filterQuery, setSearchFilter, setFilterParam } = useFilterParams({
    onSetFilter: () => {
      setSelectedIndexes({})
      setPageParam(1, 'replaceIn')
    }
  })

  useEffect(() => {
    // Reset selected rows if pageParam, perPageParam, sort, filterQuery, scope change 
    resetSelected()
  }, [pageParam, perPageParam, sort, filterQuery, scope, spaceId])

  useEffect(() => {
    setPageParam(undefined, 'replaceIn')
    setFilterParam({}, 'replaceIn')
  }, [scope])

  const query = useListQuery<T>({
    fetchList,
    scope,
    spaceId,
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
  }
}
