import { getSpaceIdFromScope } from '../../utils'
import { cleanObject } from '../../utils/object'
import type { SortConfig } from '../../types/sorting'
import type { FilterVal, HomeScope, IFilter, ServerScope } from './types'

/**
 * Formats numbers using US locale, e.g., 4000000 -> "4,000,000.00"
 * @param value - The number to format
 * @returns Formatted string with commas as thousand separators and two decimal places
 */
export const formatNumberUS = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function mapSizeFilter(filters: IFilter[]): IFilter[] {
  const value = filters.find(f => f.id === 'file_size')?.['value'] as { from?: number | null; to?: number | null } | undefined
  if (!value || typeof value !== 'object') {
    return filters
  }

  if (value.from != null) {
    filters.push({ id: 'size', value: value.from })
  }
  if (value.to != null) {
    filters.push({ id: 'size2', value: value.to })
  }

  return filters.filter(f => f.id !== 'file_size')
}
export function mapLastLoginFilter(filters: IFilter[]): IFilter[] {
  const value = filters.find(f => f.id === 'lastLogin')
  if (!value || !Array.isArray(value)) {
    return filters
  }

  if (value[0] != null) {
    filters.push({ id: 'lastLogin', value: value[0] })
  }
  if (value[1] != null) {
    filters.push({ id: 'lastLogin', value: value[1] })
  }

  return filters.filter(f => f.id !== 'lastLogin')
}

// Some of the list API's filter keys do not match their keys in JSON responses
// so we need a custom mapping
const idMappings: Record<string, string> = {
  added_by: 'username',
  engine: 'type',
  dx_instance_class: 'instance',
  launched_by: 'username',
}

export function renameFilterKeys(filters: IFilter[]) {
  return filters.map((filter: IFilter) => {
    const key = { ...filter }
    
    if (key.id in idMappings) {
      key.id = idMappings[key.id]
    }

    return key
  })
}

const customKeyMappings = {
  file_size: 'size',
  created_at_date_time: 'created_at',
  launched_by: 'username',
  launched_on: 'created_at',
  dx_instance_class: 'instance',
  createdAtDateTime: 'createdAt',
  totalLimit: 'cloudResourceSettings.total_limit',
  jobLimit: 'cloudResourceSettings.job_limit',
}
// Some of the list API's order_by values do not match their keys in JSON responses
// so we need a custom mapping
const renameOrderByKeys = (key?: string) =>
  key && key in customKeyMappings ? customKeyMappings[key as keyof typeof customKeyMappings] : key

type OrderByKeys = keyof typeof customKeyMappings
type OrderByProps = `filter[${string}]`
export type OrderBy = OrderByKeys | OrderByProps

export type SortBy = SortConfig<OrderBy>

export type Params = {
  sortBy?: SortBy
  entityScope?: string
  folderId?: string | number
  spaceId?: string | number
  perPage?: number
  page?: number
} & Record<string, unknown>

export type QueryType = Record<string, unknown>

const createSortQueryKey = (sortField: string) => sortField.split('.').reduce((key, segment) => `${key}[${segment}]`, 'sort')

export function formatScopeQ(scope?: HomeScope) {
  if (!scope || scope === 'me') return ''
  return `/${scope}`
}

export function formatScopeQuery(scope?: HomeScope, spaceId?: string|number) {
  let scopeQ = '?scope='
  if (scope) {
    const scopeVal = scope === 'me' ? 'private' : scope
    scopeQ = `${scopeQ}${scopeVal}`
  }
  if (spaceId) {
    scopeQ = `${scopeQ}space-${spaceId}`
  }
  return scopeQ
}

export const getBasePath = (spaceId?: string | number) => {
  if (spaceId) return `/spaces/${spaceId}`
  return '/home'
}

export const getBasePathFromScope = (scope?: ServerScope) => {
  const spaceId = getSpaceIdFromScope(scope)
  return getBasePath(spaceId)
}

export function prepareListFetch(filters: IFilter[], params: Params): QueryType {
  let modFilters = filters
  modFilters = renameFilterKeys(modFilters)
  modFilters = mapSizeFilter(modFilters)
  modFilters = mapLastLoginFilter(modFilters)
  modFilters = modFilters.filter(f => f.value !== undefined)

  // Convert params in a way to work with backend - not a great way to pass params in the url
  const filterParams: Record<string, FilterVal> = {}

  modFilters.forEach((f) => {
    filterParams[`filters[${f.id}]`] = f.value
  })

  const order_by_key = params.sortBy?.order_by?.includes('props.') ? 'order_by_property' : 'order_by'
  const order_by_val =
    order_by_key === 'order_by_property'
      ? params.sortBy?.order_by?.replace('props.', '')
      : renameOrderByKeys(params?.sortBy?.order_by)

  const queryParams: QueryType = cleanObject({
    scope: params.entityScope,
    folder_id: params?.folderId,
    space_id: params?.spaceId,
    per_page: params?.perPage,
    page: params?.page,
    [order_by_key]: order_by_val,
    order_dir: params?.sortBy?.order_dir,
    ...filterParams,
  })

  return queryParams
}

export function prepareListFetchV2(filters: IFilter[], params: Params): QueryType {
  let modFilters = filters
  modFilters = renameFilterKeys(modFilters)
  modFilters = mapSizeFilter(modFilters)
  modFilters = modFilters.filter(f => f.value !== undefined)

  // Convert params in a way to work with backend - not a great way to pass params in the url
  const filterParams: Record<string, FilterVal> = {}

  modFilters.forEach((f) => {
    const id = f.id as FilterVal
    filterParams[`filter[${id}]`] = f.value
  })

  const sortField = params.sortBy?.order_by?.includes('props.')
    ? params.sortBy.order_by.replace('props.', '')
    : renameOrderByKeys(params?.sortBy?.order_by)

  const sort = sortField && params.sortBy?.order_dir
    ? { [createSortQueryKey(sortField)]: params.sortBy.order_dir }
    : {}

  return cleanObject({
    folder_id: params?.folderId?.toString(),
    space_id: params?.spaceId?.toString(),
    pageSize: params?.perPage?.toString(),
    page: params?.page?.toString(),
    ...filterParams,
    ...sort,
  })
}

export const toTitleCase = (str: string) => str[0].toUpperCase() + str.slice(1)
