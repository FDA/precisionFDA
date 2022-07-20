import { pickBy } from 'lodash'
import { IFilter, ResourceScope, SortBy } from './types'

type ObjectWithId = {
  id: string
  [a: string]: any
}

// Only return the objects with keys from the pick array
export function pickActions<T>(actions: T, pick: string[]) {
  return Object.fromEntries(Object.entries(actions).filter(([k, v]) => pick.some(p => p === k))) as T
}

export function getSelectedObjectsFromIndexes<J, T extends ObjectWithId[]>(selectedIndexes?: Record<string, boolean>, objectList?: T): T {
  if (!objectList) return [] as any
  return Object.keys(selectedIndexes ?? {}).map(s => objectList.find(f => f.id === objectList[parseInt(s)]?.id)) as T
}

export function mapSizeFilter(filters: IFilter[]): IFilter[] {
  const filter: any = filters.find(f => f.id === 'file_size')

  if (filter) {
    filter.value && filters.push({ id: 'size', value: filter.value[0] } as IFilter)
    filter.value && filters.push({ id: 'size2', value: filter.value[1] } as IFilter)
    return filters.filter(f => f.id !== 'file_size')
  } 
    return filters
  
}

// Some of the list API's filter keys do not match their keys in JSON responses
// so we need a custom mapping
export function renameFilterKeys(filters: IFilter[]): IFilter[] {
  return filters.map((filter: IFilter) => {
    const key = { ...filter }
    if (key.id === 'added_by') key.id = 'username'
    if (key.id === 'engine') key.id = 'type'
    if (key.id === 'dx_instance_class') key.id = 'instance'
    if (key.id === 'launched_by') key.id = 'username'

    return key
  })
}

export function cleanObject(obj: {}) {
  return pickBy(obj, v => v !== undefined)
}

// Some of the list API's order_by values do not match their keys in JSON responses
// so we need a custom mapping
function renameOrderByKeys(key?: string): string | undefined {
  if (key === 'file_size') return 'size'
  if (key === 'created_at_date_time') return 'created_at'
  if (key === 'launched_by') return 'username'
  if (key === 'launched_on') return 'created_at'
  if (key === 'dx_instance_class') return 'instance'
  return key
}

export type Params = { folderId?: string, spaceId?: string, scope?: ResourceScope, page?: string, perPage?: number, sortBy?: SortBy }

export function formatScopeQ(scope?: ResourceScope) {
  let scopeQ = ''
  if(scope) {
    scopeQ = scope === 'me' ? '' : scope
    scopeQ = `/${  scopeQ}`
  }
  return scopeQ
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

export const toArrayFromObject = (ob: any) => Object.keys(ob).map((a: any) => ({ id: a, value: ob[a] }))
export const toObjectFromArray = (ar: any[]) => {
  const ob: any = {}
  ar.forEach(f => { ob[f.id] = f.value })
  return ob
}

export const toTitleCase = (str: string) => str[0].toUpperCase() + str.slice(1)

export const pluralize = (noun: string, count: number) => (count > 1) ? `${noun  }s` : noun

export const itemsCountString = (noun: string, count: number) => `${count} ${pluralize(noun, count)}`
