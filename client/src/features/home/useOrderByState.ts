import { useState } from 'react'
import { SortingRule } from 'react-table'
import { StringParam, useQueryParams, withDefault } from 'use-query-params'

type Cols = SortingRule<string>[]
export type SortyByParamType = {
  order_by?: string | null,
  order_dir?: string | null,
}

export interface ISortByParams {
  sortBy: SortingRule<string>[],
  sort: SortyByParamType,
  setSortBy: (cols: Cols) => void
}

export function useOrderByState({ defaultOrder, onSetSortBy }: { defaultOrder: SortyByParamType, onSetSortBy?: (cols: Cols) => void}): {sortBy: SortingRule<string>[], sort: SortyByParamType, setSortBy: (cols: Cols) => void} {
  const [sort, setSort] = useState({
    order_by: defaultOrder?.order_by,
    order_dir: defaultOrder?.order_dir,
  })
  const handleSetSortBy = (cols: Cols) => {
    onSetSortBy && onSetSortBy(cols)
    let col: any
    if (cols.length === 0) {
      col = { order_by: undefined, order_dir: undefined }
    } else if (cols[0].id) {
      col = { order_by: cols[0].id, order_dir: cols[0].desc ? 'DESC' : 'ASC' }
    }
    setSort(col)
  }
  const sortBy: SortingRule<string>[] = sort.order_by ? [{ id: sort.order_by, desc: sort.order_dir === 'DESC' }] : []
  return {
    sortBy,
    sort,
    setSortBy: handleSetSortBy,
  }
}

export function useOrderByParams({ defaultOrder, onSetSortBy }: {defaultOrder?: SortyByParamType, onSetSortBy?: (cols: Cols) => void}): ISortByParams {
  const [sortByParam, setSortByParam] = useQueryParams({
    order_by: withDefault(StringParam, defaultOrder?.order_by),
    order_dir: withDefault(StringParam,  defaultOrder?.order_dir),
  })
  const handleSetSortBy = (cols: Cols) => {
    onSetSortBy && onSetSortBy(cols)
    let col: any
    if (cols.length === 0) {
      col = { order_by: undefined, order_dir: undefined }
    } else if (cols[0].id) {
      col = { order_by: cols[0].id, order_dir: cols[0].desc ? 'DESC' : 'ASC' }
    }
    setSortByParam(col as any, 'pushIn')
  }
  const sortBy: SortingRule<string>[] = sortByParam.order_by ? [{ id: sortByParam.order_by, desc: sortByParam.order_dir === 'DESC' }] : []
  return {
    sortBy,
    sort: sortByParam,
    setSortBy: handleSetSortBy,
  }
}
