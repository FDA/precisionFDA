import { ColumnFiltersState } from '@tanstack/react-table'
import debounce from 'lodash/debounce'
import { useCallback, useState } from 'react'
import {
  DelimitedArrayParam,
  DelimitedNumericArrayParam,
  QueryParamConfig,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params'
import { toObjectFromArray } from '../../utils/object'

export const defaultFilterValues = (arr: string[]) => arr.reduce((acc: any, curr: any) => ((acc[curr] = undefined), acc), {})

function fileSizeParamMap(fileSize?: [number | null, number | null]) {
  if (fileSize) {
    // if fileSize is 0 remove it from the filter
    if (fileSize[0] === 0) {
      fileSize[0] = null
    }
    if (fileSize[1] === 0) {
      fileSize[1] = null
    }
    // if no fileSize chosen do not set it in the filter.
    if (fileSize[0] === null && fileSize[1] === null) {
      fileSize = undefined
    }
    return fileSize
  }
  return fileSize
}

function rangeParamMap(range?: [string | null, string | null]) {
  if (range) {
    if (range[0] === '' && range[1] === '') {
      range = undefined
    }
    return range
  }
  return range
}

const KEYS = [
  'id',
  'name',
  'tags',
  'featured',
  'revision',
  'added_by',
  'title',
  'state',
  'hidden',
  'status',
  'engine',
  'dx_instance_class',
  'location',
  'app_title',
  'launched_by',
  'type',
  'guest_lead',
  'host_lead',
  'workflow_title',
  'dxuser',
  'email',
  'userState',
  'lastLogin',
  'firstName',
  'lastName',
  'provisioningState',
  'createdAt',
]
function getObjectKeys(a: string[]) {
  const o = {} as Record<string, string | number | null | undefined>
  a.forEach(k => {
    o[k] = undefined
  })
  return o
}

export function useFilterState({ onSetFilter }: { onSetFilter?: (values: any) => void }) {
  const [filterQuery, setFilterParam] = useState(getObjectKeys(KEYS))
  const debouncedSetFilterQuery = debounce(v => {
    setFilterParam(v)
    if (onSetFilter) onSetFilter(v)
  }, 500)

  const setSearchFilter = useCallback((val: ColumnFiltersState) => {
    debouncedSetFilterQuery({ ...defaultFilterValues(KEYS), ...toObjectFromArray(val) })
  }, [])

  return {
    setSearchFilter,
    filterQuery,
  }
}

type FilterArgs = Record<string, string>
type ParamsType = { [key: string]: QueryParamConfig<any, any> }

export function useFilterParams({ filters, onSetFilter }: { filters: FilterArgs; onSetFilter?: (values: any) => void }) {
  const params: ParamsType = {}
  Object.keys(filters).forEach(v => {
    if (filters[v] === 'string' || filters[v] === 'number') {
      params[v] = withDefault(StringParam, undefined)
    }
    if (filters[v] === 'range') {
      params[v] = withDefault(DelimitedNumericArrayParam, undefined)
    }
    if (filters[v] === 'date_range') {
      params[v] = withDefault(DelimitedArrayParam, undefined)
    }
  })

  const [filterQuery, setFilterParam] = useQueryParams(params)
  const debouncedSetFilterQuery = debounce(v => {
    v.file_size = fileSizeParamMap([v.file_size?.from ?? null, v.file_size?.to ?? null])
    v.lastLogin = rangeParamMap([v.lastLogin?.[0] ?? '', v.lastLogin?.[1] ?? ''])
    v.createdAt = rangeParamMap([v.createdAt?.[0] ?? '', v.createdAt?.[1] ?? ''])
    setFilterParam(v, 'replaceIn')
    if (onSetFilter) onSetFilter(v)
  }, 500)

  const setSearchFilter = useCallback((val: ColumnFiltersState) => {
    debouncedSetFilterQuery({ ...defaultFilterValues(KEYS), ...toObjectFromArray(val) })
  }, [])

  return {
    setSearchFilter,
    filterQuery,
    setFilterParam,
  }
}
