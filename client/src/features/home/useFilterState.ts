import { debounce } from 'lodash'
import { useCallback, useState } from 'react'
import { DelimitedNumericArrayParam, StringParam, useQueryParams, withDefault } from 'use-query-params'
import { IFilter } from './types'
import { toObjectFromArray } from './utils'

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
  } else {
    return fileSize
  }
}

export const defaultFilterValues = (arr: string[]) => arr.reduce((acc: any, curr: any) => (acc[curr] = undefined, acc), {})

const KEYS = ['name', 'tags', 'featured', 'added_by', 'title', 'state', 'status', 'engine', 'dx_instance_class', 'location', 'app_title', 'launched_by']
function getObjectKeys<T>(a: string[]) {
  let o = {} as any
  a.forEach(k => o[k] = undefined)
  return o
}

export function useFilterState({ onSetFilter }: { onSetFilter?: (values: any) => void }) {
  const [filterQuery, setFilterParam] = useState(getObjectKeys(KEYS))
  const debouncedSetFilterQuery = debounce(v => {
    setFilterParam(v)
    onSetFilter && onSetFilter(v)
  }, 500)

  const setSearchFilter = useCallback((val: IFilter[]) => {
    debouncedSetFilterQuery({ ...defaultFilterValues(KEYS), ...toObjectFromArray(val) })
  }, [])

  return {
    setSearchFilter,
    filterQuery,
  }
}


export function useFilterParams({ onSetFilter }: { onSetFilter?: (values: any) => void }) {
  // TODO: Extract column names out of useList
  const [filterQuery, setFilterParam] = useQueryParams({
    name: withDefault(StringParam, undefined),
    title: withDefault(StringParam, undefined),
    state: withDefault(StringParam, undefined),
    engine: withDefault(StringParam, undefined),
    dx_instance_class: withDefault(StringParam, undefined),
    tags: withDefault(StringParam, undefined),
    status: withDefault(StringParam, undefined),
    featured: withDefault(StringParam, undefined),
    location: withDefault(StringParam, undefined),
    added_by: withDefault(StringParam, undefined),
    app_title: withDefault(StringParam, undefined),
    launched_by: withDefault(StringParam, undefined),
    file_size: withDefault(DelimitedNumericArrayParam, undefined),
  })

  const debouncedSetFilterQuery = debounce(v => {
    v.file_size = fileSizeParamMap(v.file_size)

    setFilterParam(v)
    onSetFilter && onSetFilter(v)
  }, 500)

  const setSearchFilter = useCallback((val: IFilter[]) => {
    debouncedSetFilterQuery({ ...defaultFilterValues(KEYS), ...toObjectFromArray(val) })
  }, [])

  return {
    setSearchFilter,
    filterQuery,
    setFilterParam,
  }
}
