import { cleanObject } from '../../utils/object'
import { IFilter, SortBy } from './types'

// Only return the objects with keys from the pick array
export function pickActions<T>(actions: T, pick: string[]) {
  return Object.fromEntries(Object.entries(actions).filter(([k, v]) => pick.some(p => p === k))) as any as T
}

export function mapSizeFilter(filters: IFilter[]): IFilter[] {
  const filter: any = filters.find(f => f.id === 'file_size')
  if (!filter) {
    return filters
  }
  filter.value?.[0] && filters.push({ id: 'size', value: filter.value[0] } as IFilter)
  filter.value?.[1] && filters.push({ id: 'size2', value: filter.value[1] } as IFilter)
  return filters.filter(f => f.id !== 'file_size')
}

// Some of the list API's filter keys do not match their keys in JSON responses
// so we need a custom mapping
export function renameFilterKeys(filters: IFilter[]) {
  return filters.map((filter: IFilter) => {
    const key = { ...filter }
    key.id = {
      added_by: 'username',
      engine: 'type',
      dx_instance_class: 'instance',
      launched_by: 'username',
    }[key.id] ?? key.id

    return key
  })
}

const customKeyMappings = {
  file_size: 'size',
  created_at_date_time: 'created_at',
  launched_by: 'username',
  launched_on: 'created_at',
  dx_instance_class: 'instance',
}
// Some of the list API's order_by values do not match their keys in JSON responses
// so we need a custom mapping
const renameOrderByKeys = (key?: string) => key && key in customKeyMappings ?
  customKeyMappings[key as keyof typeof customKeyMappings] : key

export type Params = { folderId?: string, spaceId?: string, scope?: ResourceScope, page?: string, perPage?: number, sortBy?: SortBy }

export function formatScopeQ(scope?: ResourceScope) {
  let scopeQ = ''
  if(scope) {
    scopeQ = scope === 'me' ? '' : scope
    scopeQ = `/${  scopeQ}`
  }
  return scopeQ
}

export const getBasePath = (spaceId?: string|number) => {
  if(spaceId) return `/spaces/${spaceId}`
  return '/home'
}

export const getSpaceIdFromScope = (scope: string): string | undefined => {
  if(scope) {
    const [resource, id] = scope.split('-')
    const spaceId = resource === 'space' ? id : undefined
    return spaceId
  }
  return undefined
}

export function prepareListFetch(filters: IFilter[], params: Params) {
  let modFilters = filters
  modFilters = renameFilterKeys(modFilters)
  modFilters = mapSizeFilter(modFilters)
  modFilters = modFilters.filter(f => f.value !== undefined)

  // Convert params in a way to work with backend - not a great way to pass params in the url
  const filterParams: { [key: string]: string } = {}

  modFilters.forEach((f: any) => {
    filterParams[`filters[${f.id}]`] = f.value
  })

  const queryParams = cleanObject({
    folder_id: params?.folderId,
    space_id: params?.spaceId,
    per_page: params?.perPage,
    page: params?.page,
    order_by: renameOrderByKeys(params?.sortBy?.order_by),
    order_dir: params?.sortBy?.order_dir,
    ...filterParams,
  })

  return queryParams
}

export const toTitleCase = (str: string) => str[0].toUpperCase() + str.slice(1)
