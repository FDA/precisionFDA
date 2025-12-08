import { ColumnFiltersState } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { toObjectFromArray } from '../../utils/object'

export const defaultFilterValues = (arr: string[]) => arr.reduce((acc: any, curr: any) => ((acc[curr] = undefined), acc), {})

function fileSizeParamMap(fileSize?: { from?: string | number | null; to?: string | number | null }): { from: number | null; to: number | null } | undefined {
  if (!fileSize) return undefined
  
  const from = fileSize.from !== null && fileSize.from !== undefined && fileSize.from !== '' 
    ? Number(fileSize.from) 
    : null
  const to = fileSize.to !== null && fileSize.to !== undefined && fileSize.to !== '' 
    ? Number(fileSize.to) 
    : null
  
  // if fileSize is 0 remove it from the filter
  const finalFrom = from === 0 ? null : from
  const finalTo = to === 0 ? null : to
  
  // if no fileSize chosen do not set it in the filter
  if (finalFrom === null && finalTo === null) {
    return undefined
  }
  
  return { from: finalFrom, to: finalTo }
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
  'dxInstanceClass',
]

function getObjectKeys(a: string[]) {
  const o = {} as Record<string, string | number | null | undefined>
  a.forEach(k => {
    o[k] = undefined
  })
  return o
}

type FilterArgs = Record<string, string>

// Helper to parse delimited array param
function parseDelimitedArray(value: string | null): string[] | undefined {
  if (!value) return undefined
  return value.split(',').filter(Boolean)
}

// Helper to parse underscore-delimited range param (e.g., "180_300" or "180_")
function parseRange(value: string | null): { from: number | null; to: number | null } | undefined {
  if (!value) return undefined
  const parts = value.split('_')
  if (parts.length !== 2) return undefined
  const min = parts[0] === '' ? null : Number(parts[0])
  const max = parts[1] === '' ? null : Number(parts[1])
  return {
    from: isNaN(min as number) ? null : min,
    to: isNaN(max as number) ? null : max,
  }
}

// Helper to serialize array to delimited string
function serializeArray(value: any): string | undefined {
  if (!value || !Array.isArray(value)) return undefined
  if (value.length === 0) return undefined
  return value.join(',')
}

// Helper to serialize range to underscore-delimited string (e.g., "180_300" or "180_")
function serializeRange(value: any): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  const { from, to } = value
  if (from === null && to === null) return undefined
  return `${from ?? ''}_${to ?? ''}`
}

export function useFilterParams({ filters, onSetFilter }: { filters: FilterArgs; onSetFilter?: (values: any) => void }) {
  const location = useLocation()
  const navigate = useNavigate()

  // Parse filter query from search params - always read from current location
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  
  const filterQuery: Record<string, any> = {}
  Object.keys(filters).forEach(key => {
    const paramValue = searchParams.get(key)

    if (filters[key] === 'string' || filters[key] === 'number') {
      filterQuery[key] = paramValue || undefined
    }
    if (filters[key] === 'range') {
      filterQuery[key] = parseRange(paramValue)
    }
    if (filters[key] === 'date_range') {
      filterQuery[key] = parseDelimitedArray(paramValue)
    }
  })

  const setFilterParam = useCallback((values: Record<string, any>, replace: boolean = true) => {
    // Always read from current window.location to avoid stale closure values
    const currentUrl = new URL(window.location.href)
    const newParams = new URLSearchParams(currentUrl.search)
    
    // Update or delete each value, but only for keys that are defined in filters
    for (const key in values) {
      // Skip keys that aren't in the filters definition to preserve other URL params
      if (!(key in filters)) continue
      
      const value = values[key]
      
      if (value === undefined || value === null) {
        newParams.delete(key)
      } else if (filters[key] === 'range') {
        // Range filters use object format {from, to}
        const serialized = serializeRange(value)
        if (serialized) {
          newParams.set(key, serialized)
        } else {
          newParams.delete(key)
        }
      } else if (Array.isArray(value)) {
        const serialized = serializeArray(value)
        if (serialized) {
          newParams.set(key, serialized)
        } else {
          newParams.delete(key)
        }
      } else {
        newParams.set(key, String(value))
      }
    }
    
    navigate(`${currentUrl.pathname}?${newParams.toString()}`, { replace: true })
  }, [filters, navigate])

  const setSearchFilter = useCallback((val: ColumnFiltersState) => {
    const v = { ...defaultFilterValues(KEYS), ...toObjectFromArray(val) }
    const updates = { ...v }
    updates.file_size = fileSizeParamMap(v.file_size)
    updates.lastLogin = rangeParamMap([v.lastLogin?.[0] ?? '', v.lastLogin?.[1] ?? ''])
    updates.createdAt = rangeParamMap([v.createdAt?.[0] ?? '', v.createdAt?.[1] ?? ''])
    setFilterParam(updates, false)
    if (onSetFilter) onSetFilter(updates)
  }, [setFilterParam, onSetFilter])

  return {
    setSearchFilter,
    filterQuery,
    setFilterParam,
  }
}
