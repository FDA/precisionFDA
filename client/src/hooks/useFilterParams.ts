import debounce from 'lodash/debounce'
import { useCallback } from 'react'
import { useQueryParams } from 'use-query-params'
import { FilterT } from '../utils/filters'
import { toObjectFromArray } from '../utils/object'

export const defaultFilterValues = (arr: string[]) => arr.reduce((acc: any, curr: any) => (acc[curr] = undefined, acc), {})

type UseFilterParams<FieldT extends string> = {
  // TODO(samuel) add proper typescript
  onSetFilter?: (values: any) => void,
  allFields: FieldT[],
  queryParams: Parameters<typeof useQueryParams>[0]
}

export function useFilterParams<FieldT extends string>({ onSetFilter, allFields, queryParams }: UseFilterParams<FieldT>) {
  const [filterQuery, setFilterParam] = useQueryParams(queryParams)

  const debouncedSetFilterQuery = debounce(v => {
    setFilterParam(v)
    onSetFilter && onSetFilter(v)
  }, 500)

  const setSearchFilter = useCallback((val: FilterT<FieldT>[]) => {
    debouncedSetFilterQuery({ ...defaultFilterValues(allFields), ...toObjectFromArray(val) })
  }, [])

  return {
    setSearchFilter,
    filterQuery,
    setFilterParam,
  }
}

