import { pickBy } from "lodash";
import { IFilter, SortBy } from "./types";

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
  } else {
    return filters
  }
}

export function renameFilterKeys(filters: IFilter[]): IFilter[] {
  return filters.map((filter: IFilter) => {
    let key = { ...filter }
    if (key.id === 'added_by') key.id = 'username'
    if (key.id === 'engine') key.id = 'type'
    if (key.id === 'dx_instance_class') key.id = 'instance'
    if (key.id === 'app_title') key.id = 'apptitle'
    if (key.id === 'launched_by') key.id = 'username'

    return key
  })
}

export function cleanObject(obj: {}) {
  return pickBy(obj, v => v !== undefined)
}

function renameOrderByKeys(key?: string): string | undefined {
  if (key === 'file_size') return 'size'
  if (key === 'created_at_date_time') return 'created_at'
  if (key === 'launched_by') return 'username'
  if (key === 'app_title') return 'apptitle'
  if (key === 'dx_instance_class') return 'instance'
  return key
}

export type Params = { folderId?: string, page?: string, perPage?: number, sortBy?: SortBy }

export function prepareListFetch(filters: IFilter[], params: Params, spaceId?: string) {
  let modFilters = filters
  modFilters = renameFilterKeys(modFilters)
  modFilters = mapSizeFilter(modFilters)
  modFilters = modFilters.filter(f => f.value !== undefined)

  // Convert params in a way to work with backend - not a great way to pass params in the url
  let filterParams: { [key: string]: string } = {}
  modFilters.forEach((f: any) => {
    filterParams[`filters[${f.id}]`] = f.value
  })

  const queryParams = cleanObject({
    folder_id: params?.folderId,
    per_page: params?.perPage,
    page: params?.page,
    order_by: renameOrderByKeys(params?.sortBy?.order_by),
    order_dir: params?.sortBy?.order_dir,
    space_id: spaceId,
    ...filterParams,
  })

  return queryParams
}

export const toArrayFromObject = (ob: any) => {
  return Object.keys(ob).map((a: any) => ({ id: a, value: ob[a] }))
}
export const toObjectFromArray = (ar: any[]) => {
  const ob: any = {}
  ar.forEach(f => { ob[f.id] = f.value })
  return ob
}

