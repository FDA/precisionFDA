import { useEffect, useEffectEvent } from 'react'
import { UseQueryOptions } from '@tanstack/react-query'
import { useColumnWidthLocalStorage } from '../../hooks/useColumnWidthLocalStorage'
import { useHiddenColumnLocalStorage } from '../../hooks/useHiddenColumnLocalStorage'
import { useOrderByParams } from '../../hooks/useOrderByState'
import { usePaginationParams } from '../../hooks/usePaginationState'
import { createLocationKey } from '../../utils'
import { columnFilters } from './columnFilters'
import { APIResource, HomeScope, IFilter, IMeta, MetaV2 } from './types'
import { useFilterParams } from './useFilterState'
import { useListQuery } from './useListQuery'
import { useListSelect } from './useListSelect'
import { Params } from './utils'

export type FetchListFn<T = unknown> = (filter: IFilter[], params: Params) => Promise<T>

type ListType = { [key: string]: unknown; meta: IMeta | MetaV2 }
interface IUseList<T> {
  spaceId?: string
  scope?: HomeScope
  fetchList: FetchListFn<T>
  resource: APIResource
  params?: Params
  queryOptions?: UseQueryOptions<T>
}

export function useList<T extends ListType>({ fetchList, resource, params = {}, scope }: IUseList<T>) {
  const locationKey = createLocationKey(resource, params?.spaceId)
  const pagination = usePaginationParams(resource)
  const { selectedIndexes, setSelectedIndexes } = useListSelect()
  const { sortBy, sort, setSortBy } = useOrderByParams({ onSetSortBy: () => setSelectedIndexes({}) })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(locationKey)
  const { columnVisibility, setColumnVisibility } = useHiddenColumnLocalStorage(locationKey)

  const resetSelected = useEffectEvent(() => setSelectedIndexes({}))

  const { filterQuery, setSearchFilter } = useFilterParams({
    filters: columnFilters,
  })

  useEffect(() => {
    resetSelected()
  }, [JSON.stringify(filterQuery), JSON.stringify(pagination), JSON.stringify(sort), scope, params.spaceId])

  const query = useListQuery<T>({
    fetchList,
    resource,
    pagination: { page: pagination.pageParam, perPage: pagination.perPageParam },
    sort,
    filter: filterQuery,
    scope,
    params,
  })

  return {
    setPerPageParam: pagination.setPerPageParam,
    setPageParam: pagination.setPageParam,
    perPageParam: pagination.perPageParam,
    setSearchFilter,
    setSelectedIndexes,
    resetSelected,
    setSortBy,
    sortBy,
    query,
    selectedIndexes,
    filterQuery,
    saveColumnResizeWidth,
    colWidths,
    columnVisibility,
    setColumnVisibility,
  }
}
