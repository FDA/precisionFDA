import type { ColumnSort } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  columnSortToParams,
  type OrderDir,
  paramsToColumnSort,
  type SortByParams,
  type SortParams,
} from '@/types/sorting'

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
  const location = useLocation()
  const navigate = useNavigate()

  // Read sort params from the current location (kept in sync by React Router)
  const sortByParam: SortParams = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return {
      order_by: searchParams.get('order_by') || defaultOrder?.order_by,
      order_dir: (searchParams.get('order_dir') as OrderDir) || defaultOrder?.order_dir,
    }
  }, [location.search, defaultOrder?.order_by, defaultOrder?.order_dir])

  const handleSetSortBy = useCallback(
    (cols: ColumnSort[]) => {
      if (onSetSortBy) onSetSortBy(cols)
      const newSort = columnSortToParams(cols)

      // Read directly from window.location to avoid stale React Router state –
      // this is the same pattern used by useFilterParams so both hooks stay
      // consistent and never overwrite each other's changes.
      const currentUrl = new URL(window.location.href)
      const newParams = new URLSearchParams(currentUrl.search)

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

      navigate(`${currentUrl.pathname}?${newParams.toString()}`, { replace: true })
    },
    [navigate, onSetSortBy],
  )

  const sortBy = paramsToColumnSort(sortByParam)

  return {
    sortBy,
    sort: sortByParam,
    setSortBy: handleSetSortBy,
  }
}
