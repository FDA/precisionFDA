import { useEffect, useState } from 'react'
import { UseQueryOptions } from '@tanstack/react-query'
import { useQueryParams } from 'use-query-params'
import { useOrderByParams } from './useOrderByState'
import { useFilterParams } from './useFilterParams'
import { useListQuery } from './useListQuery'
import { usePaginationParams } from './usePaginationState'

type PaginationT = {
  currentPage: number;
  nextPage: null | number;
  prevPage: null | number;
  totalPages: number;
  totalCount: number;
}
export interface MetaT {
  count: number;
  pagination: PaginationT;
}

type ListType = { [key: string]: {}, meta: MetaT }

type UseListParams<T, FieldT extends string> = {
  resource: string
  fetchList: any,
  additionalParams?: {
    [key: string]: string | undefined
  }
  
  queryOptions?: UseQueryOptions<T>
  allFields: FieldT[],
  filterQueryParams: Parameters<typeof useQueryParams>[0]
  defaultPerPage?: number
}

export function useList<T extends ListType, FieldT extends string>({ resource, fetchList, additionalParams = {}, queryOptions, allFields, filterQueryParams, defaultPerPage }: UseListParams<T, FieldT>) {
  const { pageParam, perPageParam, setPageParam, setPerPageParam } = usePaginationParams(defaultPerPage)
  const [selectedIndexes, setSelectedIndexes] = useState<Record<string, boolean> | undefined>({})
  const { sortBy, sort, setSortBy } = useOrderByParams({ onSetSortBy: (cols) => setSelectedIndexes({}) })
  const resetSelected = () => setSelectedIndexes(undefined)

  const { filterQuery, setSearchFilter } = useFilterParams({
    onSetFilter: () => {
      setSelectedIndexes({})
      setPageParam(1, 'replaceIn')
    },
    allFields,
    queryParams: filterQueryParams,
  })

  useEffect(() => {
    // Reset selected rows if pageParam, perPageParam, sort, filterQuery change 
    resetSelected()
  }, [pageParam, perPageParam, sort, filterQuery])

  const { query, cacheKey } = useListQuery<T>({
    resource,
    fetchList,
    pagination: { page: pageParam, perPage: perPageParam },
    // TODO(samuel) this param should be
    // * Validated during runtime
    // * renamed to camelCase convention in codebase (url should remain unaffected)
    order: { orderBy: sort.order_by as any, orderDir: sort.order_dir as any },
    filter: filterQuery,
    additionalParams,
    queryOptions,
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
    cacheKey,
    selectedIndexes,
    filterQuery,
    perPageParam,
  }
}
