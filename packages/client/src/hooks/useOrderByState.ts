import { ColumnSort } from '@tanstack/react-table'
import { useState } from 'react'
import { StringParam, useQueryParams, withDefault } from 'use-query-params'
import {
  OrderDirParam,
  SortParams,
  SortByParams,
  columnSortToParams,
  paramsToColumnSort,
} from '../types/sorting'

export function useOrderByState({ 
  defaultOrder, 
  onSetSortBy, 
}: { 
  defaultOrder: SortParams
  onSetSortBy?: (cols: ColumnSort[]) => void
}): SortByParams {
  const [sort, setSort] = useState<SortParams>({
    order_by: defaultOrder?.order_by,
    order_dir: defaultOrder?.order_dir,
  })
  
  const handleSetSortBy = (cols: ColumnSort[]) => {
    if (onSetSortBy) onSetSortBy(cols)
    setSort(columnSortToParams(cols))
  }
  
  const sortBy = paramsToColumnSort(sort)
  
  return {
    sortBy,
    sort,
    setSortBy: handleSetSortBy,
  }
}

export function useOrderByParams({ 
  defaultOrder, 
  onSetSortBy,
}: {
  defaultOrder?: SortParams
  onSetSortBy?: (cols: ColumnSort[]) => void
}): SortByParams {
  const [sortByParam, setSortByParam] = useQueryParams({
    order_by: withDefault(StringParam, defaultOrder?.order_by),
    order_dir: withDefault(OrderDirParam, defaultOrder?.order_dir),
  })
  
  const handleSetSortBy = (cols: ColumnSort[]) => {
    if (onSetSortBy) onSetSortBy(cols)
    setSortByParam(columnSortToParams(cols), 'pushIn')
  }
  
  const sortBy = paramsToColumnSort(sortByParam)
  
  return {
    sortBy,
    sort: sortByParam,
    setSortBy: handleSetSortBy,
  }
}
