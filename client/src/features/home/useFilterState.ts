import debounce from 'lodash/debounce'
import { useCallback, useState } from 'react'
import { DelimitedNumericArrayParam, QueryParamConfig, StringParam, useQueryParams, withDefault } from 'use-query-params'
import { defaultFilterValues } from '../../hooks/useFilterParams'
import { toObjectFromArray } from '../../utils/object'
import { IFilter } from './types'

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

const KEYS = ['name', 'tags', 'featured', 'added_by', 'title', 'state', 'status', 'engine', 'dx_instance_class', 'location', 'app_title', 'launched_by', 'type', 'guest_lead', 'host_lead', 'workflow_title']
function getObjectKeys<T>(a: string[]) {
  const o = {} as any
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

type FilterArgs =  Record<string, string>
type ParamsType = {[key: string]: QueryParamConfig<any, any>}

export function useFilterParams({ filters, onSetFilter }: { filters: FilterArgs, onSetFilter?: (values: any) => void }) {
  const params: ParamsType = {}
  Object.keys(filters).forEach(v => {
    if(filters[v] === 'string') {
      params[v] = withDefault(StringParam, undefined)
    }
    if(filters[v] === 'range') {
      params[v] = withDefault(DelimitedNumericArrayParam, undefined)
    }
  })
  const [filterQuery, setFilterParam] = useQueryParams(params)

  const debouncedSetFilterQuery = debounce(v => {
    v.file_size = fileSizeParamMap(v.file_size)
    setFilterParam(v, 'replaceIn')
    if(onSetFilter) onSetFilter(v)
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
