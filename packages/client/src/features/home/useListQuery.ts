import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { toArrayFromObject } from '../../utils/object'
import { APIResource, HomeScope, IFilter } from './types'
import { Params } from './utils'

interface IUseListQuery<T> {
  spaceId?: string
  scope?: HomeScope | string
  fetchList: (filter: IFilter[], params: Params) => Promise<T>
  resource: APIResource
  params?: Params
  order?: {
    order_by?: string | null
    order_dir?: string | null
  }
  pagination?: {
    perPage?: number
    page?: number
  }
  queryOptions?: UseQueryOptions<T>
  filter?: IFilter
}


export function useListQuery<T>({ fetchList, resource, params = {}, queryOptions, pagination = {}, order = {}, filter = {}}: IUseListQuery<T>) {
  return useQuery<T>({
    queryKey: [resource, toArrayFromObject(filter), pagination?.page, pagination?.perPage, order?.order_by, order?.order_dir, ...Object.keys(params).map(k => `${k}=${params[k]}`)],
    queryFn: () => fetchList(
      toArrayFromObject(filter),
      {
        page: pagination?.page,
        perPage: pagination?.perPage,
        sortBy: order, 
        ...params,
      }),
    refetchOnWindowFocus: false,
    ...queryOptions,
  })
}
