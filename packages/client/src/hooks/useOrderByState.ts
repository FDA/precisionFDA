import { ColumnSort } from '@tanstack/react-table'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { columnSortToParams, OrderDir, paramsToColumnSort, SortByParams, SortParams } from '../types/sorting'

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
  const [searchParams, setSearchParams] = useSearchParams()

  const sortByParam: SortParams = {
    order_by: searchParams.get('order_by') || defaultOrder?.order_by,
    order_dir: (searchParams.get('order_dir') as OrderDir) || defaultOrder?.order_dir,
  }

  const handleSetSortBy = (cols: ColumnSort[]) => {
    if (onSetSortBy) onSetSortBy(cols)
    const newSort = columnSortToParams(cols)

    setSearchParams(
      prev => {
        const newParams = new URLSearchParams(prev)

        if (newSort.order_by) {
          newParams.set('order_by', newSort.order_by)
        } else {
          newParams.delete('order_by')
        }

        if (newSort.order_dir) {
          newParams.set('order_dir', newSort.order_dir)
        } else {
          newParams.delete('order_dir')
        }

        return newParams
      },
      { replace: false },
    )
  }

  const sortBy = paramsToColumnSort(sortByParam)

  return {
    sortBy,
    sort: sortByParam,
    setSortBy: handleSetSortBy,
  }
}
