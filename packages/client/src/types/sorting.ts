import { ColumnSort } from '@tanstack/react-table'
import { QueryParamConfig } from 'use-query-params'

export type OrderDir = 'asc' | 'desc'
export type OrderBy = string
export interface SortConfig<T extends string = string> {
  order_by?: T
  order_dir?: OrderDir
}

export interface SortParams {
  order_by?: OrderBy | null
  order_dir?: OrderDir | null
}

export interface SortByParams {
  sortBy: ColumnSort[]
  sort: SortParams
  setSortBy: (cols: ColumnSort[]) => void
}

export const OrderDirParam: QueryParamConfig<
  OrderDir | null | undefined,
  OrderDir | null | undefined
> = {
  encode: value => value ?? undefined,
  decode: value => {
    if (value === 'asc' || value === 'desc') {
      return value
    }
    return undefined
  },
}

export function toSortConfig<T extends string = string>(sortParams: SortParams): SortConfig<T> {
  return {
    order_by: sortParams.order_by as T || undefined,
    order_dir: sortParams.order_dir || undefined,
  }
}

export function columnSortToParams(cols: ColumnSort[]): SortParams {
  if (cols.length === 0) {
    return { order_by: undefined, order_dir: undefined }
  }
  return {
    order_by: cols[0].id,
    order_dir: cols[0].desc ? 'desc' : 'asc',
  }
}

export function paramsToColumnSort(params: SortParams): ColumnSort[] {
  return params.order_by 
    ? [{ id: params.order_by, desc: params.order_dir === 'desc' }] 
    : []
}
