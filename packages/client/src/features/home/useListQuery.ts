import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { toArrayFromObject } from '../../utils/object'
import { SortParams, toSortConfig } from '../../types/sorting'
import { APIResource, FilterVal, HomeScope, IFilter } from './types'
import { Params, OrderBy } from './utils'

interface IUseListQuery<T> {
  spaceId?: string
  scope?: HomeScope | string
  fetchList: (filter: IFilter[], params: Params) => Promise<T>
  resource: APIResource
  params?: Params
  sort?: SortParams
  pagination?: {
    perPage?: number
    page?: number
  }
  queryOptions?: UseQueryOptions<T>
  filter?: Record<string, FilterVal>
}

export function useListQuery<T>({ 
  fetchList, 
  resource, 
  params = {}, 
  queryOptions, 
  pagination = {}, 
  sort = {}, 
  filter = {},
}: IUseListQuery<T>) {
  const sortBy = toSortConfig<OrderBy>(sort)
  
  return useQuery<T>({
    queryKey: [
      resource, 
      toArrayFromObject(filter), 
      pagination?.page, 
      pagination?.perPage, 
      sort?.order_by, 
      sort?.order_dir, 
      ...Object.keys(params).map(k => `${k}=${params[k]}`),
    ],
    queryFn: () => fetchList(
      toArrayFromObject(filter),
      {
        page: pagination?.page,
        perPage: pagination?.perPage,
        sortBy, 
        ...params,
      }),
    refetchOnWindowFocus: false,
    ...queryOptions,
  })
}
