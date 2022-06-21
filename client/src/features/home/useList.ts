import { useEffect, useState } from 'react'
import { UseQueryOptions } from 'react-query'
import { APIResource, IMeta, ResourceScope } from './types'
import { useColumnWidthLocalStorage } from './useColumnWidthLocalStorage'
import { useFilterParams } from './useFilterState'
import { useListQuery } from './useListQuery'
import { useOrderByParams } from './useOrderByState'
import { usePaginationParams } from './usePaginationState'
import { usePrevious } from '../../hooks/usePrevious';


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

const filters = {
  name: 'string',
  title: 'string',
  state: 'string',
  engine: 'string',
  dx_instance_class: 'string',
  tags: 'string',
  status: 'string',
  featured: 'string',
  location: 'string',
  added_by: 'string',
  app_title: 'string',
  launched_by: 'string',
  file_size: 'range',
}

const filterReset: Record<string, undefined> = {}
Object.keys(filters).forEach(v => {
  filterReset[v] = undefined
})


export function useList<T extends ListType>({ spaceId, scope, fetchList, resource, params = {}, queryOptions }: IUseList<T>) {
  const { pageParam, perPageParam, setPageParam, setPerPageParam } = usePaginationParams()
  const [selectedIndexes, setSelectedIndexes] = useState<Record<string, boolean> | undefined>({})
  const { sortBy, sort, setSortBy } = useOrderByParams({ onSetSortBy: (cols) => setSelectedIndexes({}) })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(resource)
  const resetSelected = () => setSelectedIndexes(undefined)

  const { filterQuery, setSearchFilter, setFilterParam } = useFilterParams({
    filters,
    onSetFilter: () => {
      setSelectedIndexes({})
      setPageParam(1, 'replaceIn')
    },
  })

  useEffect(() => {
    // Reset selected rows if pageParam, perPageParam, sort, filterQuery, scope change 
    resetSelected()
  }, [pageParam, perPageParam, sort, filterQuery, scope, spaceId])

  const prevScope = usePrevious(scope)
  useEffect(() => {
    // skip first render
    if(prevScope) {
      setPageParam(undefined, 'replaceIn')
      setFilterParam(filterReset, 'replaceIn')
    }
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
